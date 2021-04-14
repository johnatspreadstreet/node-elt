import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

export const Logger = pino({
  level,
});
