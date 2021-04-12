const { BaseClient } = require('@node-elt/tap-framework');

exports.Client = class Client extends BaseClient {
  constructor(config) {
    super(config);
  }
};
