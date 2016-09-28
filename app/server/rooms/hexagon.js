const D = require('dwayne');
const Room = require('./');
const Player = require('../players/hexagon');
const Game = require('../games/hexagon');
const {
  games: {
    hexagon: { ROOM_NSP }
  }
} = require('../../config/constants.json');

/**
 * @class HexagonRoom
 * @extends Room
 * @public
 * @returns HexagonRoom
 */
class HexagonRoom extends Room {

}

D(HexagonRoom.prototype).assign({
  _roomNsp: ROOM_NSP,
  Player,
  Game
});

module.exports = HexagonRoom;
