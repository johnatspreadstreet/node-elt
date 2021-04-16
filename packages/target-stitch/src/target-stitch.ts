#!/usr/bin/env node
import commander from 'commander';
import main from '.';
import {
  DEFAULT_BATCH_DELAY_SECONDS,
  DEFAULT_MAX_BATCH_BYTES,
  DEFAULT_MAX_BATCH_RECORDS,
} from './constants';

commander
  .option(
    '-c, --config <filename>',
    'CONFIG is a required argument that points to a JSON file containing any configuration parameters the Tap needs.'
  )
  .option('-n, --dry-run', 'Dry run - Do not push data to Stitch')
  .option('-o, --output-file <filename>', 'Save requests to this output file')
  .option('-v, --verbose', 'Produce debug-level logging')
  .option('-q, --quiet', 'Suppress info-level logging')
  .option(
    '--max-batch-records <number>',
    'Max batch records',
    DEFAULT_MAX_BATCH_RECORDS
  )
  .option(
    '--max-batch-bytes <number>',
    'Max batch bytes',
    DEFAULT_MAX_BATCH_BYTES
  )
  .option(
    '--batch-delay-seconds',
    'Batch delay seconds',
    DEFAULT_BATCH_DELAY_SECONDS
  )
  .parse(process.argv);

const opts = commander.opts();

main(opts);
