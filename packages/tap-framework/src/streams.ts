import singer from '@node-elt/singer-js';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import Logger from './logger';

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
  const { metadata } = streamCatalog;
  const streamMetadata: any = metadata.find((meta) => isEmpty(meta.breadcrumb));

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

  getUrl() {}

  getStreamData(result) {}

  getClassPath() {}

  loadSchemaByName(name) {}

  getSchema() {
    return this.loadSchemaByName(this.TABLE);
  }

  syncData(substreams = []) {
    const table = this.TABLE;
    const url = this.getUrl();
    const result = this.client.make_request(url, this.API_METHOD);
    const data = this.getStreamData(result);
  }
}
