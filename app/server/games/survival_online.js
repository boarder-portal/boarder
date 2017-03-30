const _ = require('lodash');
const Game = require('./');
const {
  games: {
    survival_online: {
      events: {
        game: {
          HELLO
        }
      }
    }
  }
} = require('../../config/constants.json');

/**
 * @class SurvivalGame
 * @extends Game
 * @public
 */
class SurvivalGame extends Game {
  static listeners = {
    [HELLO]: 'onHello'
  };

  prepareGame() {
    super.prepareGame();

    this.startGame();
    this.emit(HELLO, 'Hello, Player!');
  }

  onHello(data, socket) {
    console.log(data, socket.id);
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

module.exports = SurvivalGame;
