/* eslint-disable class-methods-use-this */
import fs from 'fs';
import { resolve } from 'path';
import get from 'lodash/get';
import { metadata, messages, Logger } from '@node-elt/singer-js';
import { StreamCatalog } from './types';

export const SPLIT_KEY = ':::';

/**
 *
 * @param streamCatalog
 */
export const isSelected = (streamCatalog: StreamCatalog) => {
  const mdata = metadata.toMap(streamCatalog.metadata);
  const streamMetadata = mdata[''];

  const { inclusion } = streamMetadata;
  const selected = get(streamMetadata, 'selected', null);
  const selectedByDefault = get(streamMetadata, 'selected-by-default', null);

  if (inclusion === 'unsupported') {
    return false;
  }

  if (selected) {
    return selected;
  }
  if (selectedByDefault) {
    return selectedByDefault;
  }

  return inclusion === 'automatic';
};

export class BaseStream {
  TABLE = null;

  KEY_PROPERTIES = [];

  API_METHOD = 'GET';

  REQUIRES = [];

  RESPONSE_KEY = 'data';

  config;

  state;

  catalog;

  client;

  substreams;

  constructor(config, state, catalog, client) {
    this.config = config;
    this.state = state;
    this.catalog = catalog;
    this.client = client;
    this.substreams = [];
  }

  responseKey() {
    return this.RESPONSE_KEY;
  }

  getMethod() {
    throw new Error(
      `getMethod has not been implemented. Please enter a method into the stream.`
    );
  }

  getUrl() {
    throw new Error(
      `getUrl has not been implemented. Please enter a URL into the stream.`
    );
  }

  // getClassPath() {}

  loadSchemaByName(name) {
    const pathToSchema = resolve(
      process.cwd(),
      'src',
      'schemas',
      `${name}.json`
    );
    const schema = fs.readFileSync(pathToSchema, { encoding: 'utf-8' });

    return JSON.parse(schema);
  }

  getSchema() {
    return this.loadSchemaByName(this.TABLE);
  }

  // matchesCatalog(cls, streamCatalog) {
  //   return streamCatalog.stream === cls.TABLE;
  // }

  generateCatalog(splitKey = SPLIT_KEY) {
    const schema = this.getSchema();
    let mdata = metadata.write([], '', 'inclusion', 'available');

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      let inclusion = 'available';

      if (this.KEY_PROPERTIES.includes(fieldName)) {
        inclusion = 'automatic';
      }

      mdata = metadata.write(
        mdata,
        `properties${splitKey}${fieldName}`,
        'inclusion',
        inclusion
      );
    }

    return {
      tap_stream_id: this.TABLE,
      stream: this.TABLE,
      key_properties: this.KEY_PROPERTIES,
      schema,
      metadata: metadata.toList(mdata),
    };
  }

  matchesCatalog(streamCatalog) {
    return streamCatalog.stream === this.TABLE;
  }

  // requirementsMet(cls, catalog) {

  // }

  writeSchema() {
    messages.writeSchema(
      this.catalog.stream,
      this.catalog.schema,
      this.catalog.key_properties
    );
  }

  sync() {
    Logger.info(
      `Syncing stream ${this.catalog.tap_stream_id} with ${this.constructor.name}`
    );

    this.writeSchema();

    return this.syncData();
  }

  transformRecord(record) {
    return record;
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

  async syncData() {
    const table = this.TABLE;

    const path = this.getUrl();
    const method = this.getMethod();

    const response = await this.client.makeRequest(path, method);

    const transformed = this.getStreamData(response);

    messages.writeRecords(table, transformed);

    return this.state;
  }
}
