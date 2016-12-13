const { io } = require('../');
const Lobby = require('../lobby');
const Game = require('../games/hexagon');
const {
  games: {
    hexagon: {
      LOBBY_NSP,
      ROOM_NSP
    }
  }
} = require('../../config/constants.json');
const rooms = [];

module.exports = () => {
  new Lobby({
    socket: io.of(LOBBY_NSP),
    roomNsp: ROOM_NSP,
    rooms,
    Game
  });
};
