const split = require('split2');
const pump = require('pump');
const through = require('through2');

const myTransport = through.obj((chunk, enc, cb) => {
  // do the necessary
  console.log(chunk);
  cb();
});

pump(process.stdin, split(JSON.parse), myTransport);
