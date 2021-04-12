import has from 'lodash/has';
import update from 'lodash/update';

export const SPLIT_KEY = ':::';

export const toMap = (rawMetadata: Array<any>) =>
  rawMetadata.reduce((acc, metaItem) => {
    const { breadcrumb, metadata } = metaItem;

    acc[breadcrumb.join(SPLIT_KEY)] = metadata;

    return acc;
  }, {});

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
