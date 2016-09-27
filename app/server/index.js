const http = require('http');
const express = require('express');
const sio = require('socket.io');
const redis = require('socket.io-redis');

const { requireAndExecute } = require('./helpers/require-glob');
const { port } = require('../config/config.json');
const {
  io: {
    livereloadNsp
  }
} = require('../config/constants.json');

const app = express();
const server = http.Server(app);
const io = sio(server);
const { NODE_ENV } = process.env;
const development = NODE_ENV === 'development';

io.adapter(redis('redis://localhost:6379'));

console.log();

requireAndExecute('/app/server/sockets/*.js', io);
requireAndExecute([
  '/app/server/routers/base.js',
  '/app/server/routers/auth.js',
  '/app/server/routers/!(api|auth|base|render).js',
  '/app/server/routers/api.js',
  '/app/server/routers/render.js'
], app);

console.log();

if (development) {
  process.on('message', (message) => {
    io.of(livereloadNsp).emit(message);
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
      io.of(livereloadNsp).emit('toreload');
      process.send('listen-success');

      setTimeout(() => {
        io.of(livereloadNsp).emit('reload');
      }, 500);
    }

    console.info('Listening on port %s...', port);
  }
});

module.exports = {
  app,
  server,
  io
};
