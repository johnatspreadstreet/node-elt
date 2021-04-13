import { resolve } from 'path';
import { messages } from '@node-elt/singer-js';
import dayjs from 'dayjs';
import get from 'lodash/get';
import fs from 'fs-extra';
import Logger from './logger';

const { writeState } = messages;

export const getLastRecordValueForTable = (state, table) => {
  const lastValue = get(state, ['bookmarks', table, 'last_record'], null);

  if (!lastValue) {
    return null;
  }

  return dayjs(lastValue).format();
};

export const incorporate = (state, table, field, value) => {
  if (!value) {
    return state;
  }

  const newState = { ...state };

  const parsed = dayjs(value).format();

  if (!get(newState, 'bookmarks', null)) {
    newState.bookmarks = {};
  }

  const lastRecord = get(newState, ['bookmarks', table, 'last_record'], null);

  if (!lastRecord || lastRecord < value) {
    newState.bookmarks[table] = {
      field,
      last_record: parsed,
    };
  }

  return newState;
};

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
    const pathToJson = resolve(process.cwd(), filename);
    const json = fs.readFileSync(pathToJson);

    return JSON.parse(json);
  } catch (e) {
    Logger.error('Failed to decode state file. Is it valid json?');
    process.exit(1);
  }
};
