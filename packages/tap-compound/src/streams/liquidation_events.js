const { gql } = require('graphql-request');
const { BaseStream } = require('./base');

exports.LiquidationEvents = class LiquidationEvents extends BaseStream {
  TABLE = 'liquidation_events';

  RESPONSE_KEY = 'liquidationEvents';

  QUERY = gql`
    query liquidation_events($skip: Int!) {
      liquidationEvents(first: 1000, skip: $skip) {
        id
        amount
        to
        from
        blockNumber
        blockTime
        cTokenSymbol
        underlyingSymbol
        underlyingRepayAmount
      }
    }
  `;

  VARIABLES = { skip: 0 };

  getMethod() {
    return this.API_METHOD;
  }

  getUrl() {
    const url = this.BASE_URL;

    return url;
  }

  getQuery() {
    return this.QUERY;
  }

  getVariables(skip) {
    this.VARIABLES = {
      skip,
    };
    return this.VARIABLES;
  }

  responseKey() {
    return this.RESPONSE_KEY;
  }
};
