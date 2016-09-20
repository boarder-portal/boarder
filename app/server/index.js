const http = require('http');
const path = require('path');
const express = require('express');
const sio = require('socket.io');
const glob = require('glob');

module.exports = (mode) => {
  const app = express();
  const server = http.Server(app);
  const io = sio(server);
  const root = path.resolve('./');

  if (!mode) {
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
  }

  return {
    listen(port) {
      return new Promise((resolve, reject) => {
        port = port || 3333;

        server.listen(port, (error) => {
          if (error) {
            console.error(error);

            reject(error);
          } else {
            console.info('Listening on port %s...', port);

            resolve();
          }
        });
      });
    },
    io
  };
};
