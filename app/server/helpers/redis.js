const path = require('path');
const fs = require('fs');
const redis = require('redis');
const {
  redis: {
    host,
    port
  }
} = require('../../config/config.json');

const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

exports.createClient = (returnBuffers) => {
  const options = {
    host,
    port
  };

  if (returnBuffers) {
    /* eslint camelcase: 0 */
    options.return_buffers = true;
  }

  const client = redis.createClient(options);

  client.on('error', (err) => {
    console.error(err);
    logs.write(`${ new Date().toISOString() }\nRedis error:\n ${ err.stack }\n\n`);
  });

  return client;
};
