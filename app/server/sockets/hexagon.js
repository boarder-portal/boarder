const {
  io: {
    hexagonLobbyNsp
  }
} = require('../../config/constants.json');

module.exports = (io) => {
  const lobby = io.of(hexagonLobbyNsp);

  lobby.on('connection', (socket) => {
    console.log('connected to hexagon lobby');

    console.log(lobby.adapter.rooms);

    socket.on('disconnect', () => {
      console.log('disconnected from hexagon lobby');
    });
  });
};
