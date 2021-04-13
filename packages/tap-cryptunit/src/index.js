const { Runner } = require('@node-elt/tap-framework');
const singer = require('@node-elt/singer-js');
const availableStreams = require('./streams');
const { Client } = require('./client');

const CONFIG_KEYS = [];

async function main(opts) {
  const errorPrefix = 'tap-cryptunit main | ';

  const args = singer.utils.parseArgs(opts, CONFIG_KEYS);
  const client = Client(args.config);
  const runner = Runner(args, client, availableStreams);

  if (args.discover) {
    runner.doDiscover();
  } else {
    runner.doSync();
  }
}

module.exports = main;
