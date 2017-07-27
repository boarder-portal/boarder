const { promisify } = require('util');
const session = require('express-session');
const { Session } = require('express-session');
const redis = require('connect-redis');
const { createClient } = require('../helpers/redis');
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
const sessionMiddleware = promisify(session({
  name: cookieName,
  store: new Store({
    client: createClient(),
    host,
    port
  }),
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: sessionExpires
  }
}));

Session.prototype.savePr = promisify(Session.prototype.save);
Session.prototype.destroyPr = promisify(Session.prototype.destroy);

module.exports = {
  async session(ctx, next) {
    await sessionMiddleware(ctx.req, ctx.res);

    ctx.session = ctx.req.session;

    await next();
  },
  async sessionRequired(ctx, next) {
    if (!ctx.session) {
      ctx.throw(500, 'No session found');
    }

    await next();
  }
};
