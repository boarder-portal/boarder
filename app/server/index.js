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
let livereload;

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
  livereload = io.of(LIVERELOAD_NSP);

  process.on('message', (message) => {
    livereload.emit(message);
  });
}

server.listen(port, (error) => {
  if (error) {
    if (development) {
      process.send('listen-error');
    }

    console.error(error);
  } else {
    if (development) {
      livereload.emit('toreload');
      process.send('listen-success');

      setTimeout(() => {
        livereload.emit('reload');
      }, 500);
    }

    console.info('Listening on port %s...', port);
  }
});
