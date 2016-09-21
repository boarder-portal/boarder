const http = require('http');
const path = require('path');
const express = require('express');
const sio = require('socket.io');
const glob = require('glob');

const { port } = require('../config/config.json');
const {
  io: {
    livereloadNsp
  }
} = require('../config/constants.json');

const app = express();
const server = http.Server(app);
const io = sio(server);
const root = path.resolve('./');
const { NODE_ENV } = process.env;
const development = NODE_ENV === 'development';

console.log();

glob
  .sync('/app/server/sockets/*.js', { root })
  .forEach((absolutePath) => {
    const relativePath = path.relative(path.join(__dirname, 'sockets'), absolutePath);

    console.log('Requiring as sockets: %s...', relativePath);

    require(absolutePath)(io);
  });

glob
  .sync('/app/server/routers/*.js', { root })
  .forEach((absolutePath) => {
    const relativePath = path.relative(path.join(__dirname, 'routers'), absolutePath);

    console.log('Requiring as routers: %s...', relativePath);

    require(absolutePath)(app);
  });

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
