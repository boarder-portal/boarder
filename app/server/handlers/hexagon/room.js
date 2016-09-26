const D = require('dwayne');
const {
  store: {
    hexagon: { ROOM_DESTRUCTION_DELAY }
  }
} = require('../../constants');
const {
  games: {
    hexagon: {
      roomStatuses: { NOT_PLAYING }
    }
  }
} = require('../../../config/constants.json');

const { isNull } = D;

module.exports = {
  onDisconnect() {
    const {
      nsp: room,
      nsp: {
        roomData,
        roomData: {
          status,
          players,
          observers,
          timeout
        },
        lobby
      },
      player
    } = this;
    const $players = D(players);

    const index = $players.indexOf(player);
    const index2 = observers.indexOf(player);

    if (index !== -1 && status === NOT_PLAYING) {
      players[player.playerId] = null;

      updateRoom(lobby, room, roomData);
    } else if (index2 !== -1) {
      observers.splice(index2, 1);

      updateRoom(lobby, room, roomData);
    }

    if ($players.every(isNull) && !observers.length) {
      const newTimeout = D(ROOM_DESTRUCTION_DELAY)
        .timeout();

      timeout.timeout = newTimeout;

      newTimeout.then(timeout.deleteRoom, () => {});
    }

    console.log('disconnected from hexagon room');
  }
};

function updateRoom(lobby, room, roomData) {
  lobby.emit('room/update', roomData);
  room.emit('room/update', roomData);
}
