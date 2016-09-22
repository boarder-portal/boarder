const express = require('express');
const constructEndpoints = require('../../helpers/construct-endpoints');
const controllers = require('../../controllers/auth');
const {
  endpoints: {
    users: paths,
    users: {
      base
    }
  }
} = require('../../../config/constants.json');

module.exports = (app) => {
  const router = new express.Router();

  constructEndpoints(paths, controllers, router);

  app.use(base, router);
};
