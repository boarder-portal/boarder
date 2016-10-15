const { date } = require('dwayne');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const {
  cookieName,
  sessionExpires,
  redis: {
    host,
    port
  },
  secret
} = require('../../config/config.json');

const Store = connectRedis(session);
const client = redis.createClient();
const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

client.on('error', (err) => {
  console.error(err);
  logs.write(`${ date().toISOString() }\nRedis error:\n ${ err.stack }\n\n`);
});

module.exports = {
  session: session({
    name: cookieName,
    store: new Store({
      client,
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
