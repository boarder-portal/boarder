const D = require('dwayne');
const Game = require('./');
const {
  games: {
    virus_war: {
      virusesTypes: {
        VIRUS,
        FORTRESS
      }
    }
  }
} = require('../../config/constants.json');

const {
  array,
  switcher
} = D;

const width = 10;
const height = 10;

const virusCellSwitcher = switcher('call', {
  player: null,
  type: null
})
  .case(({ x, y }) => x === 0 && y === 0, (players) => ({
    player: players.$[0].login,
    type: VIRUS
  }))
  .case(({ x, y }) => x === width - 1 && y === height - 1, (players) => ({
    player: players.$[1].login,
    type: VIRUS
  }));

/**
 * @class VirusWarGame
 * @extends Game
 * @public
 */
class VirusWarGame extends Game {
  prepareGame() {
    super.prepareGame();

    this.field = array(height, (y) => (
      array(width, (x) => ({
        x,
        y,
        ...virusCellSwitcher({ x, y }, [this.players])
      })).$
    )).$;
    this.players.$[0].active = true;
    this.setColors();

    this.startGame();
  }
}

module.exports = VirusWarGame;
