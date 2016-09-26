const D = require('dwayne');
const {
  io: {
    hexagonLobbyNsp,
    hexagonRoomNsp
  }
} = require('../../../config/constants.json');
const {
  store: {
    hexagon: {
      rooms,
      timeouts,
      roomDestructionDelay
    }
  }
} = require('../../constants');

module.exports = (io, roomId) => {
  const lobby = io.of(hexagonLobbyNsp);
  const room = io.of(hexagonRoomNsp.replace(/\$roomId/, roomId));
  const {
    [roomId]: roomData,
    [roomId]: {
      players
    }
  } = rooms;
  const timeout = timeouts[roomId];

  room.roomId = roomId;

  room.on('connection', (socket) => {
    console.log('connected to hexagon room');

    const { user } = socket;

    timeout.timeout.abort();

    players.push(user);

    updateRoom();

    socket.on('disconnect', () => {
      const index = players.indexOf(user);

      if (index !== -1) {
        players.splice(index, 1);

        updateRoom();
      }

      if (!players.length) {
        const newTimeout = D(roomDestructionDelay)
          .timeout();

        timeout.timeout = newTimeout;

        newTimeout.then(timeout.onDeleteRoom, () => {});
      }
    });
  });

  function updateRoom() {
    lobby.emit('room/update', roomData);
    room.emit('room/update', roomData);
  }
};
