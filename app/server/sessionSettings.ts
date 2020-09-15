import connectRedis from 'connect-redis';
import expressSession from 'express-session';
import redis from 'redis';

const SESSION_ALIVE_TIME_MS = 3 * 30 * 24 * 60 * 60 * 1000;

const redisStore = connectRedis(expressSession);
const redisClient = redis.createClient();

const sessionSettings = {
  secret: 'secrettttt',
  cookie: {
    maxAge: SESSION_ALIVE_TIME_MS,
  },
  store: new redisStore({
    client: redisClient,
    prefix: 'boarder',
  }),
};

export default sessionSettings;
