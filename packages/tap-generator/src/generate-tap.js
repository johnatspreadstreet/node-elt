const { runner } = require('hygen');
const Logger = require('hygen/lib/logger');
const path = require('path');

const defaultTemplates = path.join(__dirname, '_templates');

module.exports = (opts) => {
  console.log(opts);
  // if (!opts.name) {
  //   throw new Error('--name is a required option');
  // }

  // return runner(['tap', 'new', opts.name], {
  //   templates: defaultTemplates,
  //   cwd: process.cwd(),
  //   logger: new Logger(console.log.bind(console)),
  //   createPrompter: () => require('enquirer'),
  //   exec: (action, body) => {
  //     console.log({ action, body });
  //     const opts = body && body.length > 0 ? { input: body } : {};
  //     return require('execa').shell(action, opts);
  //   },
  //   debug: !!process.env.DEBUG,
  // });
};
