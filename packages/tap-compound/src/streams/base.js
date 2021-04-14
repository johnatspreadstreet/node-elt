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

    const url = this.getUrl();
    const query = this.getQuery();
    const variables = this.getVariables();

    const response = await this.client.makeRequest(url, query, variables);

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
