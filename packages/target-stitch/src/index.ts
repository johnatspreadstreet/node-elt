/* eslint-disable camelcase */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-globals */
import fs from 'fs';
import axios from 'axios';
import { resolve } from 'path';
import readline from 'readline';
import dayjs from 'dayjs';
import { messages, Logger } from '@node-elt/singer-js';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import size from 'lodash/size';
import sum from 'lodash/sum';
import isObjectLike from 'lodash/isObjectLike';
import { Args, Config } from './types';
import { LoggingHandler } from './logging-handler';
import { Memory } from './memory';
import { StitchHandler } from './stitch-handler';

const { isValidJSONString } = messages;

const types = ['RECORD', 'SCHEMA', 'STATE', 'ACTIVATE_VERSION'];

const emitState = (state) => {
  if (state) {
    if (isValidJSONString(state)) {
      console.log(state);
      return;
    }

    try {
      const msg = JSON.stringify(state);
      console.log(msg);
    } catch (e) {
      throw new Error('State value not in proper format. Exiting.');
    }
  }
};

const parseConfig = (configLocation) => {
  const rawData = fs.readFileSync(
    resolve(__dirname, '..', configLocation),
    'utf-8'
  );
  const CONFIG: Config = JSON.parse(rawData);

  if (!get(CONFIG, 'client_id')) {
    throw new Error("Configuration is missing required token 'field'");
  }

  if (!isObjectLike(get(CONFIG, 'batch_size_preferences'))) {
    throw new Error('batch_size_preferences in config must be an object');
  }

  if (!get(CONFIG, 'full_table_streams')) {
    CONFIG.batch_size_preferences.full_table_streams = [];
  }

  Logger.info(
    `Using batch_size_preferences of ${CONFIG.batch_size_preferences}`
  );

  if (!get(CONFIG, 'turbo_boost_factor')) {
    CONFIG.turbo_boost_factor = 1;
  }

  if (CONFIG.turbo_boost_factor !== 5) {
    Logger.info(`Using turbo_boost_factor of ${CONFIG.turbo_boost_factor}`);
  }

  if (!get(CONFIG, 'small_batch_url')) {
    throw new Error(`Configuration is missing required "small_batch_url`);
  }

  if (!get(CONFIG, 'big_batch_url')) {
    throw new Error(`Configuration is missing required "big_batch_url`);
  }

  return CONFIG;
};

const TargetStitch = (
  handlers,
  state_writer,
  max_batch_bytes,
  max_batch_records,
  batch_delay_seconds
) => ({
  messages: {},
  contains_activate_version: {},
  buffer_size_bytes: {},
  state: null,
  stream_meta: {},
  handlers,
  state_writer,
  max_batch_bytes,
  max_batch_records,
  batch_delay_seconds,
  time_last_batch_sent: dayjs().unix(),
  flush_stream(stream, is_final_stream) {
    const messages = this.messages[stream];
    const stream_meta = this.stream_meta[stream];

    let state = null;
    if (is_final_stream) {
      state = this.state;
    }

    this.handlers.forEach((handler) => {
      handler.handle_batch(
        messages,
        get(this.contains_activate_version, stream, false),
        stream_meta.schema,
        stream_meta.key_properties,
        stream_meta.bookmark_properties,
        this.state_writer,
        state
      );
    });

    this.time_last_batch_sent = dayjs().unix();
    this.contains_activate_version[stream] = false;
    this.buffer_size_bytes[stream] = 0;
    this.messages[stream] = [];

    if (is_final_stream) {
      this.state = null;
    }
  },
  flush() {
    const messages_to_flush = reduce(
      this.messages,
      (result, msgs, stream) => {
        if (size(msgs) > 0) {
          result[stream] = msgs;
        }

        return result;
      },
      {}
    );

    let num_flushed = 0;
    const num_streams = size(messages_to_flush);

    for (const [stream, msgs] of Object.entries(messages_to_flush)) {
      num_flushed += 1;
      const is_final_stream = num_flushed === num_streams;

      this.flush_stream(stream, is_final_stream);
    }

    if (num_flushed === 0 && this.state) {
      this.handlers.forEach((handler) => {
        handler.handle_state_only(this.state_writer, this.state);
      });
      this.state = null;
    }
  },
  async handle_message(message) {
    const line = JSON.stringify(message).length;
    const msgType = message.type;
    switch (msgType) {
      case 'SCHEMA': {
        this.flush();

        if (!get(this.messages, message.stream)) {
          this.messages[message.stream] = [];
        }

        this.stream_meta[message.stream] = {
          schema: message.schema,
          key_properties: message.key_properties,
          bookmark_properties: message.bookmark_properties,
        };
        break;
      }
      case 'RECORD': {
        const current_stream = message.stream;

        this.messages[current_stream].push(message);
        this.buffer_size_bytes[current_stream] =
          get(this.buffer_size_bytes, current_stream, 0) + line;

        const num_bytes = sum(Object.values(this.buffer_size_bytes));
        let num_messages = 0;
        Object.values(this.messages).forEach((streamMessages: Array<any>) => {
          num_messages += num_messages + size(streamMessages);
        });
        const num_seconds = dayjs().unix() - this.time_last_batch_sent;

        const enough_bytes = num_bytes >= this.max_batch_bytes;
        const enough_messages = num_messages >= this.max_batch_records;
        const enough_time = num_seconds >= this.batch_delay_seconds;

        if (enough_bytes || enough_messages || enough_time) {
          Logger.debug(
            `Flushing ${num_bytes} bytes, ${num_messages} messages, after ${num_seconds}`
          );
          this.flush();
        }

        break;
      }
      case 'STATE': {
        this.state = message.value;
        const num_seconds = dayjs().unix() - this.time_last_batch_sent;
        if (num_seconds > this.batch_delay_seconds) {
          Logger.debug(`Flushing state`);
        }
        this.flush();
        this.time_last_batch_sent = dayjs().unix();
        break;
      }

      default:
        console.warn('Unknown message type');
        break;
    }
  },
  consume(allMessages) {
    allMessages.forEach((message) => {
      this.handle_message(message);
    });
  },
});

const rl = readline.createInterface({
  input: process.stdin,
  // output: process.stdout,
});

const run = async (args: Args, allMessages) => {
  args.maxBatchBytes = Number(args.maxBatchBytes);
  args.maxBatchRecords = Number(args.maxBatchRecords);

  if (args.verbose) {
    Logger.level = 'debug';
  } else {
    Logger.level = 'warn';
  }

  const handlers = [];
  if (args.outputFile) {
    // TODO: Append to file
    const loggingHandler = LoggingHandler(
      args.outputFile,
      args.maxBatchBytes,
      args.maxBatchRecords
    );
    handlers.push(loggingHandler);
  }

  if (args.dryRun) {
    // TODO: Append validating handlers to file
    return;
  }

  if (!args.config) {
    throw new Error('Config file required if not in dry run mode');
  }

  const parsed = parseConfig(args.config);

  handlers.push(
    StitchHandler(parsed, args.maxBatchBytes, args.maxBatchRecords)
  );

  const targetStitch = TargetStitch(
    handlers,
    process.stdout,
    args.maxBatchBytes,
    args.maxBatchRecords,
    args.batchDelaySeconds
  );

  Logger.info('Starting consumption...');

  const STATUS_URL = 'https://api.stitchdata.com/v2/import/status';
  await axios.get(STATUS_URL);

  targetStitch.consume(allMessages);
};

const main = async (opts) => {
  const allMessages = [];
  for await (const stdin of rl) {
    const msg = JSON.parse(stdin);

    if (types.includes(msg.type)) {
      allMessages.push(messages.parseMessage(msg));
    }
  }

  Logger.info(`Starting stream with ${size(allMessages)} messages`);

  try {
    const now = dayjs().unix();
    const memory = new Memory();
    memory.start();

    await run(opts, allMessages);
  } catch (e) {
    // Error handling here for Known vs. Unknown
    Logger.error(e);
  }
};

export default main;
