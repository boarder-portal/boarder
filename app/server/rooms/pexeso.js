const D = require('dwayne');
const Room = require('./');
const Player = require('../players/pexeso');
const Game = require('../games/pexeso');
const {
  games: {
    pexeso: { ROOM_NSP }
  }
} = require('../../config/constants.json');

/**
 * @class PexesoRoom
 * @extends Room
 * @public
 * @returns PexesoRoom
 */
class PexesoRoom extends Room {

}

D(PexesoRoom.prototype).assign({
  _roomNsp: ROOM_NSP,
  Player,
  Game
});

module.exports = PexesoRoom;
