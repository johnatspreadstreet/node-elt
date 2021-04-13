const fs = require('fs');
const { resolve } = require('path');
const split = require('split2');
const pump = require('pump');
const through = require('through2');

const splitToFile = through.obj((chunk, enc, cb) => {
  // do the necessary
  const types = ['RECORD', 'SCHEMA', 'STATE'];

  const pathToLogs = resolve(process.cwd(), 'logs.txt');
  const log = fs.createWriteStream(pathToLogs, { flags: 'a' });

  if (types.includes(chunk.type)) {
    console.log(typeof chunk);
  } else {
    // log.write(`${JSON.stringify(chunk)}\n`);
  }
  cb();
});

pump(process.stdin, split(JSON.parse), splitToFile);
