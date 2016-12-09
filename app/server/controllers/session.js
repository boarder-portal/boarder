const session = require('express-session');
const redis = require('connect-redis');
const { createClient } = require('../helpers');
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
const middleware = session({
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
});

module.exports = {
  session(req, res, next) {
    middleware(req, res, (err) => {
      if (err) {
        return next(err);
      }

      const { session } = req;

      if (session) {
        session.savePr = () => (
          new Promise((resolve, reject) => {
            session.save((err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
        );

        session.destroyPr = () => (
          new Promise((resolve, reject) => {
            session.destroy((err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
        );
      }

      next();
    });
  }
};
