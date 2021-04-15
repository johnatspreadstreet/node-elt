export interface Parsed {
  config?: string;
  configPath?: string;
  state?: any;
  statePath?: string;
  catalog?: string;
  catalogPath?: string;
  generate?: boolean;
  discover?: boolean;
}

export interface Record {
  type: string;
  stream: string;
  record: any;
  version?: any;
  time_extracted?: any;
}

export interface Schema {
  type: string;
  stream: string;
  schema: any;
  key_properties?: string[];
  bookmark_properties?: string[];
}
