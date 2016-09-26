const { socketAuth } = require('../controllers/auth');
const {
  onNewRoom,
  onDisconnect
} = require('../handlers/hexagon/lobby');
const {
  io: { hexagonLobbyNsp }
} = require('../../config/constants.json');
const {
  store: {
    hexagon: { rooms }
  }
} = require('../constants');

module.exports = (io) => {
  const lobby = io.of(hexagonLobbyNsp);

  lobby.use(socketAuth);
  lobby.on('connection', (socket) => {
    console.log('connected to hexagon lobby');

    socket.emit('rooms/list', rooms);

    socket.on('room/new', onNewRoom);
    socket.on('disconnect', onDisconnect);
  });
};
