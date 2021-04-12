const fs = require('fs');
const { resolve } = require('path');
const pinoms = require('pino-multi-stream');

const streams = [
  { stream: process.stdout },
  {
    level: 'info',
    stream: fs.createWriteStream(resolve(process.cwd(), 'logging.json')),
  },
];

export const Logger = pinoms(streams);
