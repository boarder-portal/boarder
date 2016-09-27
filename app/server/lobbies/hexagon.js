const D = require('dwayne');
const { io } = require('../');
const Lobby = require('./');
const Room = require('../rooms/hexagon');
const {
  games: {
    hexagon: { lobbyNsp }
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
  lobby: io.of(lobbyNsp),
  Room,
  _rooms: rooms
});

module.exports = HexagonLobby;
