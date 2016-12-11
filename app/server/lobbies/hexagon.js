const D = require('dwayne');
const { io } = require('../');
const Lobby = require('./');
const Room = require('../rooms/hexagon');
const {
  games: {
    hexagon: { LOBBY_NSP }
  }
} = require('../../config/constants.json');
const {
  store: {
    hexagon: { rooms }
  }
} = require('../constants');

class HexagonLobby extends Lobby {

}

D(HexagonLobby.prototype).assign({
  socket: io.of(LOBBY_NSP),
  Room,
  rooms
});

module.exports = HexagonLobby;
