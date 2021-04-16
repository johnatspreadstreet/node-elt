/* eslint-disable class-methods-use-this */
const fs = require('fs');
const get = require('lodash/get');
const { resolve } = require('path');
const last = require('lodash/last');
const singer = require('@node-elt/singer-js');
const { streams, state } = require('@node-elt/tap-framework');

const { Logger } = singer;

exports.BaseStream = class BaseStream extends streams.BaseStream {
  KEY_PROPERTIES = ['id'];

  BASE_URL =
    'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2';

  PAGE_SIZE = 1000;

  loadSchemaByName(name) {
    const pathToSchema = resolve(__dirname, '..', 'schemas', `${name}.json`);
    const schema = fs.readFileSync(pathToSchema, { encoding: 'utf-8' });

    return JSON.parse(schema);
  }

  getSchema() {
    return this.loadSchemaByName(this.TABLE);
  }

  async syncData() {
    const table = this.TABLE;

    Logger.info(`Syncing data for ${table}`);

    // const response = await this.client.makeRequest(url, query, variables);

    // const transformed = this.getStreamData(response);
    const transformed = await this.syncPaginated();

    singer.messages.writeRecords(table, transformed);

    if (transformed.length > 0) {
      const lastRecord = last(transformed);
      const lastId = lastRecord.id;
      this.state = state.incorporate(this.state, table, 'id', lastId);
    }

    state.saveState(this.state);

    return this.state;
  }

  async syncPaginated() {
    let records = [];
    let keepGoing = true;
    let skip = 0;

    while (keepGoing) {
      const url = this.getUrl();
      const query = this.getQuery();
      const variables = this.getVariables(skip);

      const response = await this.client.makeRequest(url, query, variables);
      const transformed = this.getStreamData(response);
      records = [...records, ...transformed];
      skip += 1000;
      if (response.length < this.PAGE_SIZE || skip > 5000) {
        keepGoing = false;
      }
    }

    return records;
  }

  getStreamData(response) {
    const transformed = [];

    const responseKey = this.responseKey();

    const records = get(response, responseKey, null);

    if (records) {
      records.forEach((datum) => {
        const record = this.transformRecord(datum);
        transformed.push(record);
      });
    }

    return transformed;
  }
};
