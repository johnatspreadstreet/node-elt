/* eslint-disable camelcase */
import size from 'lodash/size';
import chunk from 'lodash/chunk';
import dayjs from 'dayjs';
import { Logger } from '@node-elt/singer-js';

const BIGBATCH_MAX_BATCH_BYTES = 20000000;

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
      const record_message: any = {
        action: 'upsert',
        data: message.record,
        sequence: null, // TODO
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
