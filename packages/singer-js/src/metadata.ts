import has from 'lodash/has';
import update from 'lodash/update';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import forEach from 'lodash/forEach';
import matchesProperty from 'lodash/matchesProperty';
import isEmpty from 'lodash/isEmpty';

export const SPLIT_KEY = ':::';

export const toList = (compiledMetadata) => {
  const list = [];

  for (const [k, v] of Object.entries(compiledMetadata)) {
    let breadcrumb = [];
    if (k !== '') {
      breadcrumb = k.split(SPLIT_KEY);
    }

    list.push({ breadcrumb, metadata: v });
  }

  return list;
};

export const write = (compiledMetadata = {}, breadcrumb: string, k, val) => {
  if (!val) {
    throw new Error('val is required to write metadata');
  }

  if (has(compiledMetadata, breadcrumb)) {
    update(compiledMetadata, breadcrumb, () => ({ [k]: val }));
    return compiledMetadata;
  }

  return {
    ...compiledMetadata,
    [breadcrumb]: { [k]: val },
  };
};
