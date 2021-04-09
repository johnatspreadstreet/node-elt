---
to: tap-<%=name%>/src/index.js
---
const { Runner } = require('@node-elt/tap-framework');
const singer = require('@node-elt/singer-js');
const { AVAILABLE_STREAMS } = require('./streams');
const { Client } = require('./client');
const Logger = require('./logger');

const CONFIG_KEYS = [];

class <%=Name%>Runner extends Runner {}

async function main(opts) {
  const args = singer.utils.parse_args(opts, CONFIG_KEYS);
  const client = new Client(args.config);
  const runner = new <%=Name%>Runner(args, client, AVAILABLE_STREAMS);

  if (args.discover) {
    runner.do_discover();
  } else {
    runner.do_sync();
  }
}

module.exports = main;
