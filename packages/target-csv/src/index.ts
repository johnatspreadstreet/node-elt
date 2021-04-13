/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-restricted-globals */
import { resolve } from 'path';
import readline from 'readline';
import { format } from '@fast-csv/format';
import dayjs from 'dayjs';
import { messages } from '@node-elt/singer-js';
import get from 'lodash/get';
import split from 'split2';
import pump from 'pump';
import through from 'through2';
import { write } from './csv2';
import { Csv } from './csv';

const emitState = (state) => {};

// @ts-ignore
const isDate = (d) => d instanceof Date && !isNaN(d);

const flatten = function (data, delimiter = '.') {
  const result = {};
  function recurse(cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop ? `${prop}${delimiter}${i}` : `${i}`);
      if (l == 0) result[prop] = [];
    } else if (isDate(cur)) {
      result[prop] = cur.toString();
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? `${prop}${delimiter}${p}` : p);
      }
      if (isEmpty) result[prop] = {};
    }
  }
  recurse(data, '');
  return result;
};

const persistRecord = async (o, timestamp) => {
  const record = get(o, 'record', null);
  const streamName = get(o, 'stream', null);

  const fileName = `${streamName}-${timestamp}.csv`;
  await write(fileName, 'test', flatten(record));
};

const sendUsageStats = () => {};

const rl = readline.createInterface({
  input: process.stdin,
  // output: process.stdout,
});

const main = async (opts) => {
  const now = dayjs().unix();

  const config = {};
  if (opts.config) {
    // Handle config options here
  }

  let state = null;
  const schemas = {};
  const key_properties = {};
  const headers = {};
  const validators = {};

  for await (const msg of rl) {
    const types = ['RECORD', 'SCHEMA', 'STATE'];

    const o = messages.parseMessage(msg);

    const msgType = o.type;

    switch (msgType) {
      case 'RECORD':
        await persistRecord(o, now);
        break;
      case 'STATE':
        state = get(o, 'value', null);
        break;
      case 'SCHEMA':
        const stream = get(o, 'stream', null);
        schemas[stream] = get(o, 'schema', null);
        key_properties[stream] = get(o, 'key_properties', null);
        break;

      default:
        console.warn('Unknown message type');
        break;
    }
  }

  console.log(state);
};

export default main;
