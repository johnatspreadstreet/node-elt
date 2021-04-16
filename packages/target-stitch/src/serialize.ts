/* eslint-disable camelcase */
import toString from 'lodash/toString';
import size from 'lodash/size';
import chunk from 'lodash/chunk';
import padStart from 'lodash/padStart';
import dayjs from 'dayjs';
import { Logger } from '@node-elt/singer-js';

const BIGBATCH_MAX_BATCH_BYTES = 20000000;
const MILLISECOND_SEQUENCE_MULTIPLIER = 1000;
const NANOSECOND_SEQUENCE_MULTIPLIER = 1000000;

const modulo = NANOSECOND_SEQUENCE_MULTIPLIER / MILLISECOND_SEQUENCE_MULTIPLIER;
const zfill_width_mod =
  size(toString(NANOSECOND_SEQUENCE_MULTIPLIER)) -
  size(toString(MILLISECOND_SEQUENCE_MULTIPLIER));

/**
 * Generates a unique sequence number based on the current time in nanoseconds
 * with a zero-padded message number based on the index of the record within the
 * magnitude of max_records.
 *
 * COMPATIBILITY:
 * Maintains a historical width of 19 characters (with default `max_records`), in order
 * to not overflow downstream processes that depend on the width of this number.
 *
 * Because of this requirement, `message_num` is modulo the difference between nanos
 * and millis to maintain 19 characters.
 * @param message_num Index of message in total messages
 * @param max_records Total number of records
 * @returns {number} Sequence number
 */
const generate_sequence = (message_num, max_records) => {
  const nanosecond_sequence_base = toString(dayjs().unix());

  const fill = size(toString(10 * max_records)) - zfill_width_mod;
  const sequence_suffix = padStart(
    toString(Number(message_num % modulo)),
    fill,
    '0'
  );

  if (message_num < 100) {
    console.log({
      nanosecond_sequence_base,
      modulo,
      zfill_width_mod,
      fill,
      sequence_suffix,
      output: nanosecond_sequence_base + sequence_suffix,
      outputNum: Number(nanosecond_sequence_base + sequence_suffix),
    });
  }

  return Number(nanosecond_sequence_base + sequence_suffix);
};

/**
 * Produces request bodies for Stitch.
 *
 * Builds a request body consisting of all the messages. Serializes it as
 * JSON. If the result exceeds the request size limit, splits the batch
 * in half and recurs.
 *
 * @param messages Stdin messages
 * @param schema Schema of messages
 * @param key_names Primary key names of message set
 * @param bookmark_names State bookmark names
 * @param max_bytes Max number of bytes to be sent per request
 * @param max_records Max number of records to be sent per request
 * @returns {array}
 */
export const serialize = (
  messages,
  schema,
  key_names,
  bookmark_names,
  max_bytes,
  max_records
) => {
  const serialized_messages = [];

  messages.forEach((message, idx) => {
    if (message.type === 'RECORD') {
      const sequence = generate_sequence(idx, max_records);
      if (!sequence) {
        console.log({ idx, max_records });
      }
      const record_message: any = {
        action: 'upsert',
        data: message.record,
        sequence,
      };

      if (message.time_extracted) {
        record_message.time_extracted = dayjs(message.time_extracted).unix();
      }

      serialized_messages.push(record_message);
    }
  });

  const body: any = {
    table_name: messages[0].stream,
    schema,
    key_names,
    messages: serialized_messages,
  };

  if (bookmark_names) {
    body[bookmark_names] = bookmark_names;
  }

  const serialized = JSON.stringify(body);

  Logger.debug(
    `Serialized ${size(messages)} messages into ${size(serialized)} bytes`
  );

  if (size(serialized) < max_bytes) {
    return [serialized];
  }

  if (size(messages) <= 1) {
    if (size(serialized) < BIGBATCH_MAX_BATCH_BYTES) {
      return [serialized];
    }
    throw new Error(
      `A single record is larger than the Stitch API limit of ${Math.floor(
        BIGBATCH_MAX_BATCH_BYTES / 1000000
      )} MB`
    );
  }

  const pivot = Math.floor(size(messages) / 2);
  const [l_chunk, r_chunk] = chunk(messages, pivot);
  const l_half = serialize(
    l_chunk,
    schema,
    key_names,
    bookmark_names,
    max_bytes,
    max_records
  );
  const r_half = serialize(
    r_chunk,
    schema,
    key_names,
    bookmark_names,
    max_bytes,
    max_records
  );

  return [...l_half, ...r_half];
};
