export interface Config {
  token: string;
  client_id: number;
  small_batch_url: string;
  big_batch_url: string;
  batch_size_preferences: {
    full_table_streams?: Array<any>;
  };
  turbo_boost_factor?: number;
}

export interface Args {
  config: any;
  dryRun?: boolean;
  outputFile?: any;
  verbose?: boolean;
  quiet?: boolean;
  maxBatchRecords: string | number;
  maxBatchBytes: string | number;
  batchDelaySeconds: string | number;
}
