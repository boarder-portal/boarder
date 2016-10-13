const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const sio = require('socket.io');
const redis = require('socket.io-redis');

const { requireAndExecute } = require('./helpers/require-glob');
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

io.adapter(redis(`redis://${ redisHost }:${ redisPort }`));

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

const logs = fs.createWriteStream(path.resolve('./logs/server.log'));

process.on('uncaughtException', (e) => {
  logs.write(`Uncaught exception:\n ${ e.stack }\n\n`);
});

process.on('unhandledRejection', (e) => {
  logs.write(`Unhandled rejection:\n ${ e.stack }\n\n`);
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
