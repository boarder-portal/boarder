const {
  io: { hexagonNsp }
} = require('../../config/constants.json');

module.exports = (io) => {
  const nsp = io.of(hexagonNsp);

  nsp.on('connection', (socket) => {
    console.log('connected');

    socket.on('disconnect', () => {
      console.log('disconnected');
    });
  });
};
