const { BaseStream } = require('./base');

exports.Algorithms = class Algorithms extends BaseStream {
  API_METHOD = 'GET';

  TABLE = 'algorithms';

  KEY_PROPERTIES = ['id'];

  PATH = '/api/algos';

  RESPONSE_KEY = 'data';

  responseKey() {
    return this.RESPONSE_KEY;
  }
};
