/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { resolve } from 'path';
import has from 'lodash/has';
import { Parsed } from './types';

const checkConfig = (config, requiredKeys: string[]) => {
  requiredKeys.forEach((property) => {
    if (!has(config, property)) {
      throw new Error(`Missing required property: ${property}`);
    }
  });
};

export const parseArgs = (args, requiredKeys) => {
  const parsed: Parsed = {};

  if (args.config) {
    parsed.configPath = args.config;
    parsed.config = require(resolve(process.cwd(), args.config));
  }

  if (args.state) {
    parsed.statePath = args.state;
    parsed.state = require(resolve(process.cwd(), args.state));
  } else {
    parsed.state = {};
  }

  if (args.catalog) {
    parsed.catalogPath = args.catalog;
    parsed.catalog = require(resolve(process.cwd(), args.catalog));
  }

  if (args.discover) {
    parsed.discover = true;
  }

  checkConfig(parsed.config, requiredKeys);

  return parsed;
};
