import get from 'lodash/get';
import update from 'lodash/update';

export const write = (compiledMetadata, breadcrumb, k, val) => {
  if (!val) {
    throw new Error('val is required to write metadata');
  }

  const value: any = { [k]: val };
  if (get(compiledMetadata, breadcrumb)) {
    update(compiledMetadata, breadcrumb, value);
  } else {
    compiledMetadata[breadcrumb] = value;
  }

  return compiledMetadata;
};
