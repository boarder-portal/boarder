import connectRedis from 'connect-redis';
import expressSession, { SessionOptions } from 'express-session';
import redis from 'redis';

import { MONTH } from 'common/constants/date';

const SESSION_ALIVE_TIME_MS = 3 * MONTH;

const redisStore = connectRedis(expressSession);
const redisClient = redis.createClient();

const sessionSettings: SessionOptions = {
  secret: 'secrettttt',
  cookie: {
    maxAge: SESSION_ALIVE_TIME_MS,
  },
  store: new redisStore({
    client: redisClient,
    prefix: 'boarder',
  }),
  resave: false,
  saveUninitialized: false,
};

export default sessionSettings;
