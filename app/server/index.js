require('../../scripts/babel-register');

require('./plugins');

console.log();

const path = require('path');
const fs = require('fs');
const http = require('http');
const Application = require('koa');
const sio = require('socket.io');
const redis = require('socket.io-redis');

const { requireAndExecute, createClient } = require('./helpers');

const {
  port,
  redis: {
    host: redisHost,
    port: redisPort
  }
} = require('../config/config.json');
const { LIVERELOAD_NSP } = require('../config/constants.json');

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
  host: redisHost,
  port: redisPort,
  pubClient: createClient(true),
  subClient: createClient(true)
}));

console.log();

requireAndExecute('/app/server/sockets/*.js', io);

console.log();

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
  logs.write(`${new Date().toISOString()}\nUncaught exception:\n ${err.stack}\n\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(err);
  logs.write(`${new Date().toISOString()}\nUnhandled rejection:\n ${err.stack}\n\n`);
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
