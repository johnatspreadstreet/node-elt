const { BaseClient } = require('@node-elt/tap-framework');

// exports.Client = class Client extends BaseClient {};

exports.Client = (config) => {
  const baseClient = BaseClient(config);

  return {
    ...baseClient,
  };
};
