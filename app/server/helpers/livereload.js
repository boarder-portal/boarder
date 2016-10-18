const { redisClient } = require('./redis');
const {
  redis: redisOpts
} = require('../../config/config.json');
const { LIVERELOAD_NSP } = require('../../config/constants.json');
const io = require('socket.io-emitter')(redisClient, redisOpts);

module.exports = {
  toreload() {
    io.of(LIVERELOAD_NSP).emit('toreload');
  },
  reload() {
    io.of(LIVERELOAD_NSP).emit('reload');
  }
};
