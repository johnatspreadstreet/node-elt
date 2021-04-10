import { messages } from '@node-elt/singer-js';
import fs from 'fs-extra';
import Logger from './logger';

const { writeState } = messages;

export const getLastRecordValueForTable = (state, table) => {};

export const saveState = (state) => {
  if (!state) {
    return;
  }

  writeState(state);
};

export const loadState = (filename) => {
  if (!filename) {
    return {};
  }

  try {
    const json = fs.readFileSync(filename);

    return JSON.parse(json);
  } catch (e) {
    Logger.error('Failed to decode state file. Is it valid json?');
    process.exit(1);
  }
};
