/* eslint-disable class-methods-use-this */
import fs from 'fs';
import { resolve } from 'path';
import get from 'lodash/get';
import size from 'lodash/size';
import { metadata, messages } from '@node-elt/singer-js';
import Logger from './logger';

export const SPLIT_KEY = ':::';

type Inclusion = 'available' | 'automatic' | 'unsupported';

interface MetaObject {
  inclusion: Inclusion;
  selected?: boolean;
  'table-key-properties'?: string[];
  'valid-replication-keys'?: string[];
  'schema-name': string;
}

interface Metadata {
  metadata: MetaObject;
  breadcrumb: string[]; // The breadcrumb object above defines the path into the schema to the node to which the metadata belongs. Metadata for a stream will have an empty breadcrumb.
}

interface StreamCatalog {
  stream: any; // The name of the stream
  tap_stream_id: string; // The unique identifier for the stream. This is allowed to be different from the name of the stream in order to allow for sources that have duplicate stream names.
  schema: any; // JSON schema for the stream
  table_name: string; // For a database source, name of the table
  metadata?: Metadata[];
}

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

  getUrl() {
    return null;
  }

  getStreamData(result) {
    return null;
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

  generateCatalog() {
    const schema = this.getSchema();
    let mdata = metadata.write([], '', 'inclusion', 'available');

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      let inclusion = 'available';

      if (this.KEY_PROPERTIES.includes(fieldName)) {
        inclusion = 'automatic';
      }

      mdata = metadata.write(
        mdata,
        `properties${SPLIT_KEY}${fieldName}`,
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
    Logger.info(`Syncing stream ${this.catalog.tap_stream_id}`);

    this.writeSchema();

    return this.syncData();
  }

  transformRecord(record) {
    return record;
  }

  async syncData(substreams = []) {
    const table = this.TABLE;
    const url = this.getUrl();

    const result = await this.client.makeRequest(url, this.API_METHOD);
    const data = this.getStreamData(result);

    data.forEach((obj, index) => {
      Logger.info(`On ${index} of ${size(data)}`);
      // messages.writeRecords();
    });
  }
}
