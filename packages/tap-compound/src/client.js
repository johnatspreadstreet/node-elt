const { request, gql } = require('graphql-request');
const { Logger } = require('@node-elt/singer-js');
const { BaseClient } = require('@node-elt/tap-framework');

exports.Client = (config) => {
  const baseClient = BaseClient(config);

  return {
    ...baseClient,
    async makeRequest(url, query, variables) {
      try {
        const response = await request(url, query, variables);

        return response;
      } catch (e) {
        Logger.error({ e, config });
      }
    },
  };
};
