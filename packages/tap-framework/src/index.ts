/* eslint-disable camelcase */
import Logger from './logger';
import { saveState } from './state';
import { isSelected } from './streams';

export function Runner(args, client, availableStreams) {
  return {
    config: args.config,
    state: args.state,
    catalog: args.catalog,
    client,
    availableStreams,
    getStreamsToReplicate() {
      const streams = [];

      if (!this.catalog) {
        return streams;
      }

      this.catalog.streams.forEach((streamCatalog) => {
        if (!isSelected(streamCatalog)) {
          Logger.debug(
            `${streamCatalog.stream} is not marked selected, skipping.`
          );
          return;
        }

        this.availableStreams.forEach((availableStream) => {
          if (availableStream.matches_catalog(streamCatalog)) {
            if (!availableStream.requirements_met(this.catalog)) {
              throw new Error(
                `${streamCatalog.stream} requires that the following are selected: `
              );
            }

            const toAdd = availableStream(
              this.config,
              this.state,
              streamCatalog,
              this.client
            );

            streams.push(toAdd);
          }
        });
      });

      return streams;
    },

    doDiscover() {
      const catalog = [];

      this.availableStreams.forEach((AvailableStream) => {
        const stream = new AvailableStream(this.config, this.state, null, null);

        catalog.push(stream.generateCatalog());
      });

      const data = {
        streams: catalog,
      };

      process.stdout.write(JSON.stringify(data));
    },

    doSync() {
      Logger.debug('Starting sync.');

      const errorPrefix = 'Runner [doSync] | ';

      const streams = this.getStreamsToReplicate();

      streams.forEach((stream) => {
        try {
          stream.state = this.state;
          stream.sync();
          this.state = stream.state;
        } catch (e) {
          Logger.error(
            `${errorPrefix}Failed to sync endpoint ${stream.TABLE}. Moving on.`
          );
        }
      });

      saveState(this.state);
    },
  };
}

export * from './client';
export * as streams from './streams';
