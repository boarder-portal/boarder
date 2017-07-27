const { resolve } = require('path');
const serve = require('koa-static');
const mount = require('koa-mount');
const { session } = require('../controllers/session');
const { ASSETS_PATH, VENDOR_PATH } = require('../../config/constants.json');

module.exports = (app) => {
  app.use(mount(ASSETS_PATH, serve(resolve('./public'))));
  app.use(mount(VENDOR_PATH, serve(resolve('./node_modules'))));

  app.use(session);
};
