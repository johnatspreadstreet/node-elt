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

const persistMessages = (delimiter, quotechar, messages, destinationPath) => {};

const sendUsageStats = () => {};

async function* stdin() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = [];
  let resolve;
  let promise = new Promise((r) => (resolve = r));
  let close;

  rl.on('line', (line) => {
    lines.push(line);
    resolve();
  });

  while (!close) {
    await promise;
    close = ((yield lines.pop()) || {}).close;
    if (!lines.length) promise = new Promise((r) => (resolve = r));
  }

  rl.close();
}

const main = async (opts) => {
  const config = {};
  if (opts.config) {
    // Handle config options here
  }

  let state = null;
  const schemas = {};
  const key_properties = {};
  const headers = {};
  const validators = {};
  const csvStreams = {};

  for await (const msg of stdin()) {
    const types = ['RECORD', 'SCHEMA', 'STATE'];

    const o = messages.parseMessage(msg);

    if (types.includes(o.type)) {
      const msgType = o.type;

      if (msgType === 'RECORD') {
        const record = get(o, 'record', null);
        const streamName = get(o, 'stream', null);
        const now = dayjs().unix();

        const fileName = `${streamName}-${now}.csv`;
        await write(fileName, 'test', record);

        // if (csvFile) {
        //   // File exists, append
        //   // await csvFile.append([record]);
        // } else {
        //   const pathToFile = resolve(process.cwd(), fileName);
        //   csvStreams[fileName] = Csv({
        //     path: pathToFile,
        //     headers: Object.keys(record),
        //   });
        //   console.log(csvStreams[fileName]);
        //   await csvStreams[fileName].create([record]);
        // }
      } else if (msgType === 'STATE') {
        state = get(o, 'value', null);
      } else if (msgType === 'SCHEMA') {
        const stream = get(o, 'stream', null);
        schemas[stream] = get(o, 'schema', null);
        key_properties[stream] = get(o, 'key_properties', null);
      } else {
        console.warn(`Unknown message type`);
      }
    } else {
      // log.write(`${JSON.stringify(chunk)}\n`);
    }
  }
};

export default main;
