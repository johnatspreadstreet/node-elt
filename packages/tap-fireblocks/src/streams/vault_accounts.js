const { BaseStream } = require('./base');

exports.VaultAccounts = class VaultAccounts extends BaseStream {
  API_METHOD = 'GET';

  TABLE = 'vaults';

  KEY_PROPERTIES = ['id'];

  PATH = '/v1/vault/accounts';

  RESPONSE_KEY = 'data';

  getMethod() {
    return this.API_METHOD;
  }

  getUrl() {
    const url = `${this.BASE_URL}${this.PATH}`;

    return url;
  }

  responseKey() {
    return this.RESPONSE_KEY;
  }
};
