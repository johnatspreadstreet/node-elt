#!/usr/bin/env node
import commander from 'commander';
import main from '.';

commander
  .option(
    '-c, --config <filename>',
    'CONFIG is a required argument that points to a JSON file containing any configuration parameters the Tap needs.'
  )
  .parse(process.argv);

const opts = commander.opts();

main(opts);
