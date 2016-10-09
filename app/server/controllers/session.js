const session = require('express-session');
const redis = require('connect-redis');
const {
  cookieName,
  sessionExpires,
  redis: redisCredentials,
  secret
} = require('../../config/config.json');

const Store = redis(session);

module.exports = {
  session: session({
    name: cookieName,
    store: new Store(redisCredentials),
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionExpires
    }
  })
};
