/* eslint-disable camelcase */
import fs from 'fs';
import get from 'lodash/get';
import axios, { AxiosRequestConfig } from 'axios';
import { resolve } from 'path';
import { Logger } from '@node-elt/singer-js';
import { saveState } from './state';
import { isSelected } from './streams';
import { jsonToJsonSchema } from './utils';

export * from './client';
export * as state from './state';
export * as streams from './streams';

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
          // Logger.info(
          //   `${streamCatalog.stream} is not marked selected, skipping.`
          // );
          return;
        }

        this.availableStreams.forEach((AvailableStream) => {
          const availableStream = new AvailableStream(
            this.config,
            this.state,
            null,
            null
          );

          if (availableStream.matchesCatalog(streamCatalog)) {
            // if (!availableStream.requirements_met(this.catalog)) {
            //   throw new Error(
            //     `${streamCatalog.stream} requires that the following are selected: `
            //   );
            // }

            const toAdd = new AvailableStream(
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

    doGenerate() {
      Logger.debug('Starting sync.');

      const errorPrefix = 'Runner [doGenerate] | ';

      const generateConfig = get(this.config, 'generate', null);

      if (!generateConfig) {
        throw new Error(
          `${errorPrefix} generate is required in config file for --generate`
        );
      }

      const paths = Object.keys(generateConfig);

      paths.forEach((path) => {
        const axiosConfig: AxiosRequestConfig = generateConfig[path];

        console.log(axiosConfig);
      });

      throw new Error('Not implemented');
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

      const pathToCatalog = resolve(process.cwd(), 'catalog.json');
      fs.writeFileSync(pathToCatalog, JSON.stringify(data, null, 2));
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
