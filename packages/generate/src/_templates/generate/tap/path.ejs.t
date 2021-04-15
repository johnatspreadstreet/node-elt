---
to: tap-<%=name%>/src/streams/path.js
---
const { BaseStream } = require('./base');

exports.Path = class Path extends BaseStream {
  API_METHOD = 'GET';

  TABLE = '';

  KEY_PROPERTIES = ['id'];

  PATH = '';

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
