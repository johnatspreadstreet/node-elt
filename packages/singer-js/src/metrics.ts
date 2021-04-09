const Tag = {
  endpoint: 'endpoint',
  job_type: 'job_type',
  http_status_code: 'http_status_code',
  status: 'status',
};

const Metric = {
  record_count: 'record_count',
  job_duration: 'job_duration',
  http_request_duration: 'http_request_duration',
};

const DEFAULT_LOGINTERVAL = 60;
class Counter {
  metric;

  constructor(metric, tags = null, logInterval = DEFAULT_LOGINTERVAL) {
    this.metric = metric;
  }
}

/**
 * Use for counting records retrieved from the source.
 * @param {*} endpoint
 * @param {*} logInterval
 */
const recordCounter = (endpoint, logInterval) => {
  const tags = {};

  if (endpoint) {
    tags[Tag.endpoint] = endpoint;
  }

  return new Counter(Metric.record_count, tags, logInterval);
};
