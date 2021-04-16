const inquirer = require('inquirer');
const { runner } = require('hygen');
const Logger = require('hygen/lib/logger');
const { readdirSync } = require('fs');
const { join } = require('path');

const packagesDir = join(__dirname, '../../');
const defaultTemplates = join(__dirname, '_templates');

const getAvailableGenerators = () => {
  const directoryPath = join(__dirname, '_templates', 'generate');

  const getDirectories = (source) =>
    readdirSync(source, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

  return getDirectories(directoryPath);
};

const getOptions = async () => {
  const generators = getAvailableGenerators();
  return inquirer.prompt([
    {
      type: 'list',
      name: 'generator',
      message: 'What would you like to generate?',
      choices: generators,
    },
  ]);
};

const run = async () => {
  const options = await getOptions();

  return runner(['generate', options.generator], {
    templates: defaultTemplates,
    cwd: packagesDir,
    logger: new Logger(console.log.bind(console)),
    createPrompter: () => require('enquirer'),
    exec: (action, body) => {
      console.log({ action, body });
      const opts = body && body.length > 0 ? { input: body } : {};
      return require('execa').shell(action, opts);
    },
    debug: !!process.env.DEBUG,
  });
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
