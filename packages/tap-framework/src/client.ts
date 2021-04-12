import axios from 'axios';
import Logger from './logger';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* eslint-disable class-methods-use-this */
export class BaseClient {
  config = {};

  constructor(config) {
    this.config = config;
  }

  getAuthorization() {
    throw new Error('getAuthorization not implemented!');
  }

  async makeRequest(url, method, baseBackoff = 45, params = null, body = null) {
    Logger.debug(`Making ${method} request to ${url}`);

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

      if (response.status !== 200) {
        throw new Error(response.statusText);
      }

      return response.data;
    } catch (e) {
      throw new Error(e.response);
    }
  }
}
