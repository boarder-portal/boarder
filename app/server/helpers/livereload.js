const { createClient } = require('./redis');
const {
  redis: redisOpts
} = require('../../config/config.json');
const { LIVERELOAD_NSP } = require('../../config/constants.json');
const io = require('socket.io-emitter')(createClient(), redisOpts);

module.exports = {
  emit(...args) {
    io.of(LIVERELOAD_NSP).emit(...args);
  }
};
