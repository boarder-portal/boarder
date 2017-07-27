const Application = require('koa');
const mount = require('koa-mount');

const errors = require('../controllers/errors');
const helpers = require('../controllers/helpers');
const { requireAndExecute } = require('../helpers');
const { endpoints } = require('../../config/constants.json');

const apiApp = new Application();

requireAndExecute('/app/server/routers/api/*.js', apiApp);

module.exports = (app) => {
  app.use(errors);
  app.use(helpers);
  app.use(mount(endpoints.base, apiApp));
};
