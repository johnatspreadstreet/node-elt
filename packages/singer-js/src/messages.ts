import dayjs from 'dayjs';
import get from 'lodash/get';
import hasIn from 'lodash/hasIn';

export const isValidJSONString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
};

const _requiredKey = (msg, k) => {
  const has = hasIn(msg, k);

  if (!has) {
    throw new Error(`Message is missing required key ${k}`);
  }

  return msg[k];
};

const RecordMessage = (
  stream,
  record,
  version = null,
  time_extracted = null
) => {
  const result = {
    type: 'RECORD',
    stream,
    record,
    version: null,
    time_extracted: null,
  };

  if (version) {
    result.version = version;
  }

  if (time_extracted) {
    const asUtc = dayjs(time_extracted).format();
    result.time_extracted = asUtc;
  }

  return result;
};

const SchemaMessage = (stream, schema, key_properties, bookmark_properties) => {
  const result = {
    type: 'SCHEMA',
    stream,
    schema,
    key_properties,
    bookmark_properties,
  };

  if (bookmark_properties) {
    result.bookmark_properties = bookmark_properties;
  }

  return result;
};

const StateMessage = (value) => ({
  type: 'STATE',
  value,
});

const ActivateVersionMessage = (stream, version) => ({
  type: 'ACTIVATE_VERSION',
  stream,
  version,
});

export const parseMessage = (message) => {
  let obj = message;

  if (isValidJSONString(message)) {
    obj = JSON.parse(message);
  }
  const msgType = _requiredKey(obj, 'type');

  if (msgType === 'RECORD') {
    let timeExtracted = get(obj, 'time_extracted');

    if (timeExtracted) {
      try {
        timeExtracted = dayjs(timeExtracted).format();
      } catch (e) {
        timeExtracted = null;
      }
    }

    const stream = _requiredKey(obj, 'stream');
    const record = _requiredKey(obj, 'record');
    const version = get(obj, 'version', null);
    return RecordMessage(stream, record, version, timeExtracted);
  }

  if (msgType === 'SCHEMA') {
    return SchemaMessage(
      _requiredKey(obj, 'stream'),
      _requiredKey(obj, 'schema'),
      _requiredKey(obj, 'key_properties'),
      get(obj, 'bookmark_properties', null)
    );
  }

  if (msgType === 'STATE') {
    return StateMessage(_requiredKey(obj, 'value'));
  }

  if (msgType === 'ACTIVATE_VERSION') {
    return ActivateVersionMessage(
      _requiredKey(obj, 'stream'),
      _requiredKey(obj, 'version')
    );
  }

  return null;
};

export const writeMessage = (message) => {
  const errorPrefix = 'Messages [writeMessage] | ';

  if (isValidJSONString(message)) {
    console.log(message);
    return;
  }

  try {
    const json = JSON.stringify(message);
    console.log(json);
  } catch (e) {
    throw new Error(`${errorPrefix} failed converting message to JSON.`);
  }
};

/**
 * Write a single record for the given stream.
 *
 * @example
 * ```
 * writeRecord("users", {"id": 2, "email": "mike@stitchdata.com"})
 * ```
 *
 * @param streamName
 * @param record
 * @param streamAlias
 * @param timeExtracted
 */
export const writeRecord = (
  streamName,
  record,
  streamAlias = null,
  timeExtracted = null
) => {
  const result = {
    type: 'RECORD',
    stream: streamAlias || streamName,
    record,
    time_extracted: null,
  };

  if (timeExtracted) {
    const asUTC = dayjs(timeExtracted).format();
    result.time_extracted = asUTC;
  } else {
    const asUTC = dayjs().format();
    result.time_extracted = asUTC;
  }

  writeMessage(result);
};

/**
 * Write a list of records for the given stream.
 *
 * @example
 * ```
 * const chris = {"id": 1, "email": "chris@stitchdata.com"};
 * const mike = {"id": 2, "email": "mike@stitch"};
 *
 * writeRecords("users", [chris, mike])
 * ```
 *
 * @param streamName
 * @param records
 */
export const writeRecords = (streamName, records) => {
  records.forEach((record) => writeRecord(streamName, record));
};

export const writeState = (value) => {
  writeMessage(StateMessage(value));
};

/**
 * Write a schema message.
 * @param streamName
 * @param schema
 * @param keyProperties
 * @param bookmarkProperties
 * @param streamAlias
 */
export const writeSchema = (
  streamName,
  schema,
  keyProperties,
  bookmarkProperties = null,
  streamAlias = null
) => {
  const result = {
    type: 'SCHEMA',
    stream: streamAlias || streamName,
    schema,
    key_properties: keyProperties,
    bookmark_properties: null,
  };

  if (bookmarkProperties) {
    result.bookmark_properties = bookmarkProperties;
  }

  writeMessage(result);
};
