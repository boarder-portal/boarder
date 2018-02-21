import path from 'path';
import fs from 'fs';
import redis from 'redis';

import config from '../config';

const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

export function createClient(returnBuffers) {
  const options = { ...config.redis };

  if (returnBuffers) {
    /* eslint camelcase: 0 */
    options.return_buffers = true;
  }

  const client = redis.createClient(options);

  client.on('error', (err) => {
    console.error(err);
    logs.write(`${new Date().toISOString()}\nRedis error:\n ${err.stack}\n\n`);
  });

  return client;
}
