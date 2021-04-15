export type Inclusion = 'available' | 'automatic' | 'unsupported';

export interface MetaObject {
  inclusion: Inclusion;
  selected?: boolean;
  'table-key-properties'?: string[];
  'valid-replication-keys'?: string[];
  'schema-name': string;
}

export interface Metadata {
  metadata: MetaObject;
  breadcrumb: string[]; // The breadcrumb object above defines the path into the schema to the node to which the metadata belongs. Metadata for a stream will have an empty breadcrumb.
}

export interface StreamCatalog {
  stream: any; // The name of the stream
  tap_stream_id: string; // The unique identifier for the stream. This is allowed to be different from the name of the stream in order to allow for sources that have duplicate stream names.
  schema: any; // JSON schema for the stream
  table_name: string; // For a database source, name of the table
  metadata?: Metadata[];
}
