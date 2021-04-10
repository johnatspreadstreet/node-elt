import dayjs from 'dayjs';

const isValidJSONString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
};

export const stateMessage = (value) => ({
  type: 'STATE',
  value,
});

export const writeMessage = (message) => {
  const errorPrefix = 'Messages [writeMessage] | ';

  if (isValidJSONString(message)) {
    process.stdout.write(message);
  }

  try {
    JSON.stringify(message);
  } catch (e) {
    throw new Error(`${errorPrefix} failed converting message to JSON.`);
  }

  process.stdout.write(JSON.stringify(message));
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
  writeMessage(stateMessage(value));
};
