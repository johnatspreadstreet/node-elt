#!/usr/bin/env node

const program = require('commander');

program
  .command('tap', 'Generate new tap', {
    isDefault: true,
  })
  .parse(process.argv);
