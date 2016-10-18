const { date } = require('dwayne');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const sio = require('socket.io');
const redis = require('socket.io-redis');

const { requireAndExecute, redisClient } = require('./helpers/require-glob');
const {
  port,
  redis: {
    host: redisHost,
    port: redisPort
  }
} = require('../config/config.json');
const { LIVERELOAD_NSP } = require('../config/constants.json');

const app = express();
const server = http.Server(app);
const io = sio(server);
const { NODE_ENV } = process.env;
const development = NODE_ENV === 'development';
const logFile = path.resolve('./logs/server.log');
const logs = fs.createWriteStream(logFile, {
  flags: 'r+',
  start: fs.readFileSync(logFile, { encoding: 'utf8' }).length
});

io.adapter(redis({
  host: redisHost,
  port: redisPort,
  pubClient: redisClient,
  subClient: redisClient
}));

module.exports = {
  app,
  server,
  io
};

console.log();

requireAndExecute('/app/server/sockets/*.js', io);
requireAndExecute([
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

process.on('uncaughtException', (err) => {
  console.error(err);
  logs.write(`${ date().toISOString() }\nUncaught exception:\n ${ err.stack }\n\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  logs.write(`${ date().toISOString() }\nUnhandled rejection:\n ${ err.stack }\n\n`);
});

server.listen(port, (error) => {
  if (error) {
    if (development) {
      process.send('listen-error');
    }

    console.error(error);
  } else {
    console.info('Listening on port %s...', port);
  }
});
