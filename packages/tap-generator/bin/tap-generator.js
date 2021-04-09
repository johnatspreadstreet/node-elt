#!/usr/bin/env node
const commander = require('commander');
const runner = require('../src');

commander
  .option(
    '--name <tapname>',
    'TAPNAME is a required argument that will name your generator tap-<TAPNAME>'
  )
  .parse(process.argv);

const opts = commander.opts();

runner(opts);
