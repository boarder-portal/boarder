const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { session } = require('../controllers/session');

const { ASSETS_PATH } = require('../../config/constants.json');

module.exports = (app) => {
  app.use(ASSETS_PATH, express.static(path.resolve('./public')));

  app.use(session);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
};
