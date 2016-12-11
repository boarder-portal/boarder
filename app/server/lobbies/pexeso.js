const D = require('dwayne');
const { io } = require('../');
const Lobby = require('./');
const Room = require('../rooms/pexeso');
const {
  games: {
    pexeso: { LOBBY_NSP }
  }
} = require('../../config/constants.json');
const {
  store: {
    hexagon: { rooms }
  }
} = require('../constants');

class PexesoLobby extends Lobby {

}

D(PexesoLobby.prototype).assign({
  socket: io.of(LOBBY_NSP),
  Room,
  rooms
});

module.exports = PexesoLobby;
