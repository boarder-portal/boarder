const Game = require('./');

/**
 * @class SetGame
 * @extends Game
 * @public
 */
class SetGame extends Game {
  prepareGame() {
    super.prepareGame();

    this.startGame();
  }
}

module.exports = SetGame;
