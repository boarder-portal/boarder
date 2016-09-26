const D = require('dwayne');
const {
  io: { hexagonLobbyNsp }
} = require('../../config/constants.json');
const { socketAuth } = require('../controllers/auth');
const createRoom = require('./hexagon/room');
const {
  store: {
    hexagon: {
      rooms,
      timeouts,
      roomDestructionDelay
    }
  }
} = require('../constants');
const { now } = D;

module.exports = (io) => {
  const lobby = io.of(hexagonLobbyNsp);

  lobby.use(socketAuth());
  lobby.on('connection', (socket) => {
    console.log('connected to hexagon lobby');

    socket.emit('rooms/list', rooms);

    socket.on('room/new', () => {
      const roomId = now();
      const name = `room-${ roomId }`;
      const room = rooms[roomId] = {
        id: roomId,
        name,
        status: 'not playing',
        players: []
      };

      const timeout = D(roomDestructionDelay)
        .timeout();

      timeout.then(onDeleteRoom, () => {});

      timeouts[roomId] = {
        timeout,
        onDeleteRoom
      };

      createRoom(io, roomId);

      lobby.emit('room/new', room);

      function onDeleteRoom() {
        console.log('deleting room', roomId);

        delete rooms[roomId];
        delete timeouts[roomId];

        lobby.emit('room/delete', roomId);
      }
    });

    socket.on('disconnect', () => {
      console.log('disconnected from hexagon lobby');
    });
  });
};
