const { BaseStream } = require('./base');

exports.Coins = class Coins extends BaseStream {
  API_METHOD = 'GET';

  TABLE = 'coins';

  KEY_PROPERTIES = ['id'];

  PATH = '/api/coins';

  RESPONSE_KEY = 'data';

  getMethod() {
    return this.API_METHOD;
  }

  getUrl() {
    return `${this.BASE_URL}${this.PATH}`;
  }

  responseKey() {
    return this.RESPONSE_KEY;
  }
};
