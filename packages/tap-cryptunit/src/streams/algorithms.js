const { BaseStream } = require('./base');

exports.Algorithms = class Algorithms extends BaseStream {
  API_METHOD = 'GET';

  TABLE = 'algorithms';

  KEY_PROPERTIES = ['id'];

  PATH = '/api/algos';

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
