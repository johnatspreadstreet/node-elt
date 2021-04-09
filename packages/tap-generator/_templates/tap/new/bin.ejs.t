---
to: tap-<%=name%>/bin/tap-<%=name%>.js
---
#!/usr/bin/env node
const commander = require('commander');
const main = require('../src');

commander
  .option(
    '--config <filename>',
    'CONFIG is a required argument that points to a JSON file containing any configuration parameters the Tap needs.'
  )
  .option(
    '--state <filename>',
    'STATE is an optional argument pointing to a JSON file that the Tap can use to remember information from the previous invocation, like, for example, the point where it left off.'
  )
  .option(
    '--catalog <filename>',
    'CATALOG is an optional argument pointing to a JSON file that the Tap can use to filter which streams should be synced.'
  )
  .option('--discover', 'DISCOVER Do schema discovery')
  .parse(process.argv);

const opts = commander.opts();

main(opts);
