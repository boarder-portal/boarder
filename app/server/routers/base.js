const path = require('path');
const express = require('express');
const session = require('express-session');
const redis = require('connect-redis');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const Store = redis(session);
const { assetsPath } = require('../../config/constants.json');
const { secret } = require('../../config/config.json');

module.exports = (app) => {
  app.use(assetsPath, express.static(path.resolve('./public')));

  app.use(session({
    store: new Store({
      host: 'localhost',
      port: 6379
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000
    }
  }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
};
