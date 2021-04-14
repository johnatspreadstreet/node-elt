---
to: tap-<%=name%>/src/client.js
---
const { BaseClient } = require('@node-elt/tap-framework');

exports.Client = (config) => {
  const baseClient = BaseClient(config);

  return {
    ...baseClient,
  };
};
