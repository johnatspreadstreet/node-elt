import axios from 'axios';
import { Logger } from '@node-elt/singer-js';
import { asyncErrorHandler, axiosErrorHandler } from './error-handler';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const BaseClient = (config) => ({
  config,
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
  getAuthorization() {
    throw new Error('getAuthorization not implemented!');
  },

  async makeRequest(url, method, baseBackoff = 45, params = null, body = null) {
    // Logger.info(`Making ${method} request to ${url}`);

    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      params,
      body,
    };

    try {
      const response = await axios(config);

      if (response.status === 429) {
        Logger.error(
          `Got a 429 error, sleeping for ${baseBackoff} seconds and trying again`
        );
        await delay(baseBackoff * 1000);
        return this.makeRequest(url, method, baseBackoff * 2, params, body);
      }

      if (!this.validateStatus(response.status)) {
        return axiosErrorHandler(response);
      }

      return response;
    } catch (e) {
      Logger.error({ e, config });
      return axiosErrorHandler(e);
    }
  },
});
