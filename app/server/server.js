import path from 'path';
import fs from 'fs';
import http from 'http';
import Application from 'koa';
import sio from 'socket.io';
import redis from 'socket.io-redis';

import './plugins';

import {
  importAndExecute,
  createClient
} from './helpers';
import config from './config';
import { LIVERELOAD_NSP } from '../shared/constants';

const app = new Application();
const server = http.Server(app.callback());
const io = sio(server);
const { NODE_ENV } = process.env;
const development = NODE_ENV === 'development';
const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

io.adapter(redis({
  host: config.redis.host,
  port: config.redis.port,
  pubClient: createClient(true),
  subClient: createClient(true)
}));

process.on('uncaughtException', (err) => {
  console.error(err);
  logs.write(`${new Date().toISOString()}
Uncaught exception:
${err.stack}

`);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  logs.write(`${new Date().toISOString()}
Unhandled rejection:
${err.stack}

`);
});

async function main() {
  console.log();

  await importAndExecute('/app/server/sockets/*.js', io);

  console.log();

  await importAndExecute([
    '/app/server/routers/base.js',
    '/app/server/routers/locale.js',
    '/app/server/routers/api.js',
    '/app/server/routers/render.js',
    '/app/server/routers/errors.js'
  ], app);

  console.log();

  if (development) {
    const livereload = io.of(LIVERELOAD_NSP);

    process.on('message', (message) => {
      if (message === 'tokill') {
        livereload.emit('tokill');
      }
    });

    livereload.once('connection', () => {
      process.send('listen-success');
      livereload.emit('reload');
    });

    livereload.on('connection', (socket) => {
      socket.on('tokill-event', () => {
        process.send('tokill');
      });
    });
  }

  server.listen(config.port, (error) => {
    if (error) {
      if (development) {
        process.send('listen-error');
      }

      console.error(error);
    } else {
      console.info('Listening on port %s...', config.port);
    }
  });
}

main().catch((err) => {
  console.log('Init error:', err);
  process.exit(1);
});
