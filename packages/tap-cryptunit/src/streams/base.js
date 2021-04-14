const last = require('lodash/last');
const singer = require('@node-elt/singer-js');
const { streams, state } = require('@node-elt/tap-framework');
const Logger = require('../logger');

exports.BaseStream = class BaseStream extends streams.BaseStream {
  KEY_PROPERTIES = ['id'];

  BASE_URL = 'https://www.cryptunit.com';

  async syncData() {
    const table = this.TABLE;

    Logger.info(`Syncing data for ${table}`);

    const path = this.getUrl();
    const method = this.getMethod();

    const response = await this.client.makeRequest(path, method);

    const transformed = this.getStreamData(response);

    singer.messages.writeRecords(table, transformed);

    if (transformed.length > 0) {
      const lastRecord = last(transformed);
      const lastId = lastRecord.id;
      this.state = state.incorporate(this.state, table, 'last_id', lastId);
    }

    state.saveState(this.state);

    return this.state;
  }

  getStreamData(response) {
    const transformed = [];

    const responseKey = this.responseKey();
    response[responseKey].forEach((datum) => {
      const record = this.transformRecord(datum);
      transformed.push(record);
    });

    return transformed;
  }
};
