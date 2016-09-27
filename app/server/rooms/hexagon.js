const D = require('dwayne');
const Room = require('./');
const {
  games: {
    hexagon: { roomNsp }
  }
} = require('../../config/constants.json');
const {
  store: {
    hexagon: { rooms }
  }
} = require('../constants');

/**
 * @class HexagonRoom
 * @extends Room
 * @public
 * @returns HexagonRoom
 */
class HexagonRoom extends Room {

}

D(HexagonRoom.prototype).assign({
  _roomNsp: roomNsp,
  rooms
});

module.exports = HexagonRoom;
