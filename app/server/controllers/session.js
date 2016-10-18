const session = require('express-session');
const redis = require('connect-redis');
const { redisClient } = require('../helpers');
const {
  cookieName,
  sessionExpires,
  redis: {
    host,
    port
  },
  secret
} = require('../../config/config.json');

const Store = redis(session);

module.exports = {
  session: session({
    name: cookieName,
    store: new Store({
      client: redisClient,
      host,
      port
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionExpires
    }
  })
};
