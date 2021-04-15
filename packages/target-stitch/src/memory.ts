import { Logger } from '@node-elt/singer-js';
import { delay } from './delay';

export class Memory {
  MEMORY_UPDATE_INTERVAL_MS: number;

  constructor() {
    this.MEMORY_UPDATE_INTERVAL_MS = 10000;
  }

  start = () => {
    Logger.info({
      at: 'Memory [start]',
      message: 'Starting Memory Reporter',
    });
    this._poll();
  };

  _poll = async () => {
    for (;;) {
      try {
        await this._update();
      } catch (error) {
        Logger.error({
          at: 'Memory [_poll]',
          message: error.message,
          error,
        });
      }

      await delay(this.MEMORY_UPDATE_INTERVAL_MS);
    }
  };

  _update = async () => {
    Logger.info({
      at: 'Memory [_update]',
      message: 'Updating memory...',
    });

    const usage = process.memoryUsage();

    const used = usage.heapUsed / 1024 / 1024;

    Logger.info({
      at: 'Memory [_update]',
      message: `The script uses approximately ${
        Math.round(used * 100) / 100
      } MB`,
    });
  };
}
