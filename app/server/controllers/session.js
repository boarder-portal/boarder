const session = require('express-session');
const redis = require('connect-redis');
const {
  cookieName,
  sessionExpires,
  secret
} = require('../../config/config.json');

const Store = redis(session);

module.exports = {
  session: session({
    name: cookieName,
    store: new Store({
      host: 'localhost',
      port: 6379
    }),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionExpires
    }
  })
};
