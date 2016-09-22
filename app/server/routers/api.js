const express = require('express');
const { requireAndExecute } = require('../helpers/require-glob');
const { endpoints } = require('../../config/constants.json');

const router = new express.Router();

requireAndExecute('/app/server/routers/api/*.js', router);

module.exports = (app) => {
  app.use(endpoints.base, router);
};
