const D = require('dwayne');
const Game = require('./');

const { array } = D;

/**
 * @class VirusWarGame
 * @extends Game
 * @public
 */
class VirusWarGame extends Game {
  prepareGame() {
    super.prepareGame();

    this.field = array(10, (y) => (
      array(10, (x) => ({
        x,
        y,
        shape: null
      })).$
    )).$;
    this.setColors();
  }
}

module.exports = VirusWarGame;
