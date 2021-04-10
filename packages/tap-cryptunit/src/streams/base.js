const singer = require('@node-elt/singer-js');
const { streams } = require('@node-elt/tap-framework');
const Logger = require('../logger');

exports.BaseStream = class BaseStream extends streams.BaseStream {
  //   syncPaginated(path, method) {}

  syncData(path, method) {
    const table = this.TABLE;

    Logger.info(`Syncing data for ${table}`);

    const response = this.client.makeRequest(path, method);
    const transformed = this.getStreamData(response);

    singer.messages.writeRecords(table, transformed);

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
