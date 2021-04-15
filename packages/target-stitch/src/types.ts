export interface Config {
  token: string;
  client_id: number;
  small_batch_url: string;
  big_batch_url: string;
  batch_size_preferences: any;
}

export interface Args {
  config: any;
  dryRun?: boolean;
  outputFile?: any;
  verbose?: boolean;
  quiet?: boolean;
  maxBatchRecords?: string | number;
  maxBatchBytes?: string | number;
  batchDelaySeconds?: string | number;
}
