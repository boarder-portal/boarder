const path = require('path');
const fs = require('fs');
const { date } = require('dwayne');
const redis = require('redis');
const {
  redis: {
    host,
    port
  }
} = require('../../config/config.json');

const client = redis.createClient({
  host,
  port
});
const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

client.on('error', (err) => {
  console.error(err);
  logs.write(`${ date().toISOString() }\nRedis error:\n ${ err.stack }\n\n`);
});

exports.redisClient = client;
