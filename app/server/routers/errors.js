const {
  BoarderClientError
} = require('../helpers');

module.exports = (app) => {
  app.on('error', (err) => {
    if (!(err instanceof BoarderClientError)) {
      console.log('Middleware error:', err);
    }
  });
};
