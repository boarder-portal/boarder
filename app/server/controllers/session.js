import util from 'util';
import expressSession, { Session } from 'express-session';
import redis from 'connect-redis';

import { createClient } from '../helpers/redis';
import config from '../config';

const Store = redis(expressSession);
const sessionMiddleware = util.promisify(expressSession({
  name: config.cookieName,
  store: new Store({
    client: createClient(),
    host: config.redis.host,
    port: config.redis.port
  }),
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: config.sessionExpires
  }
}));

Session.prototype.savePr = util.promisify(Session.prototype.save);
Session.prototype.destroyPr = util.promisify(Session.prototype.destroy);

export async function session(ctx, next) {
  await sessionMiddleware(ctx.req, ctx.res);

  ctx.session = ctx.req.session;

  await next();
}

export async function sessionRequired(ctx, next) {
  if (!ctx.session) {
    ctx.throw(500, 'No session found');
  }

  await next();
}
