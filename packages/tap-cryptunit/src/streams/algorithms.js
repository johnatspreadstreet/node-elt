const logger = require('../logger');
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
    const url = `${this.BASE_URL}${this.PATH}`;

    return url;
  }

  responseKey() {
    return this.RESPONSE_KEY;
  }
};
