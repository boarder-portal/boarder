const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { assetsPath } = require('../../config/constants.json');

module.exports = (app) => {
  app.use(assetsPath, express.static(path.resolve('./public')));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
};
