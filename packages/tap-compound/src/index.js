const singer = require('@node-elt/singer-js');
const { Runner } = require('@node-elt/tap-framework');
const availableStreams = require('./streams');
const { Client } = require('./client');

const { Logger } = singer;

const CONFIG_KEYS = [];

async function main(opts) {
  Logger.info('Starting stream');

  const args = singer.utils.parseArgs(opts, CONFIG_KEYS);
  const client = Client(args.config);
  const runner = Runner(args, client, availableStreams);

  if (args.generate) {
    return runner.doGenerate();
  }

  if (args.discover) {
    return runner.doDiscover();
  }

  return runner.doSync();
}

module.exports = main;
