/* eslint-disable camelcase */
import axios, { AxiosRequestConfig } from 'axios';
import size from 'lodash/size';
import get from 'lodash/get';
import { BadRequest } from '@feathersjs/errors';
import { Logger } from '@node-elt/singer-js';
import { axiosErrorHandler } from './error-handler';
import { delay } from './delay';
import { Config } from './types';
import { serialize } from './serialize';
import { DEFAULT_MAX_BATCH_BYTES } from './constants';

const PENDING_REQUESTS = [];
const SEND_EXCEPTION = null;

const determine_stitch_url = (stream_name, config: Config) => {
  const batch_size_prefs = config.batch_size_preferences;
  const full_table_streams = get(batch_size_prefs, 'full_table_streams');
  if (get(full_table_streams, stream_name)) {
    return config.big_batch_url;
  }

  if (get(batch_size_prefs, 'batch_size_preference') === 'bigbatch') {
    return config.big_batch_url;
  }

  if (get(batch_size_prefs, 'batch_size_preference') === 'smallbatch') {
    return config.small_batch_url;
  }

  return config.small_batch_url;
};

const check_send_exception = () => {};

const finish_requests = async (max_count = 0) => {
  while (true) {
    check_send_exception();
    if (size(PENDING_REQUESTS) <= max_count) {
      break;
    }
    await delay(1000);
  }
};

const validateStatus = (status) => status >= 200 && status < 300;

const makeRequest = async (
  url,
  method,
  headers,
  baseBackoff = 45,
  params = null,
  data = null
) => {
  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    headers,
  };

  if (params) {
    axiosConfig.params = params;
  }

  if (data) {
    axiosConfig.data = data;
  }

  try {
    const response = await axios(axiosConfig);

    Logger.debug(response);

    if (response.status === 429) {
      Logger.error(
        `Got a 429 error, sleeping for ${baseBackoff} seconds and trying again`
      );
      await delay(baseBackoff * 1000);
      return makeRequest(url, method, baseBackoff * 2, params, data);
    }

    return response;
  } catch (e) {
    const baseErrorPath = 'data';
    const status = get(e, ['response', 'status']);

    if (status === 400) {
      return axiosErrorHandler(e, `${baseErrorPath}.error`);
    }
    return axiosErrorHandler(e, `${baseErrorPath}.error`);
  }
};

/**
 * Sends messages to Stitch
 * @param config Parsed config
 * @param max_batch_bytes Max batch size in bytes
 * @param max_batch_records Max batch size in number of records
 */
export const StitchHandler = (
  config: Config,
  max_batch_bytes,
  max_batch_records
) => ({
  token: config.token,
  max_batch_bytes,
  max_batch_records,
  flush_states(state_writer, future) {},
  headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  },
  async send(data, contains_activate_version, state_writer, state, stitch_url) {
    // TODO: Check exception
    check_send_exception();

    const headers = this.headers();
    let verify_ssl = true;
    if (process.env.TARGET_STITCH_SSL_VERIFY === 'false') {
      verify_ssl = false;
    }

    Logger.info(`Sending batch of ${size(data)} to ${stitch_url}`);

    if (size(PENDING_REQUESTS) > 0 && contains_activate_version) {
      Logger.info(
        `Sending batch with ActivateVersion. Flushing PENDING_REQUESTS first`
      );
      // await finish_requests();
    }

    if (size(PENDING_REQUESTS) >= config.turbo_boost_factor) {
      // await finish_requests(config.turbo_boost_factor - 1);
    }

    Logger.info(`Making Request`);

    await makeRequest(stitch_url, 'POST', headers, null, null, data);
  },
  handle_state_only(state_writer = null, state = null) {
    // TODO
  },
  handle_batch(
    messages,
    contains_activate_version,
    schema,
    key_names,
    bookmark_names = null,
    state_writer = null,
    state = null
  ) {
    let stitch_url = determine_stitch_url(messages[0].stream, config);

    const bodies = serialize(
      messages,
      schema,
      key_names,
      bookmark_names,
      this.max_batch_bytes,
      this.max_batch_records
    );

    bodies.forEach((body, i) => {
      if (size(body) > Number(DEFAULT_MAX_BATCH_BYTES)) {
        stitch_url = config.big_batch_url;
      }
      let flushable_state = null;
      if (i + 1 === size(bodies)) {
        flushable_state = state;
      }

      this.send(
        body,
        contains_activate_version,
        state_writer,
        flushable_state,
        stitch_url
      );
    });
  },
});
