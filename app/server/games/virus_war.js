const D = require('dwayne');
const Game = require('./');
const {
  games: {
    virus_war: {
      virusesTypes: { VIRUS },
      virusesShapes: shapesObject
    }
  }
} = require('../../config/constants.json');

const {
  array,
  switcher
} = D;

const shapes = D(shapesObject).keys();
const width = 10;
const height = 10;

const virusCellSwitcher = switcher('call', {
  player: null,
  type: null
})
  .case(({ x, y }) => x === 0 && y === 0, (players) => ({
    player: players.$[0].login,
    shape: players.$[0].data.shape,
    type: VIRUS
  }))
  .case(({ x, y }) => x === width - 1 && y === height - 1, (players) => ({
    player: players.$[1].login,
    shape: players.$[1].data.shape,
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
    this.setShapes();

    this.startGame();
  }

  setShapes() {
    const { players } = this;
    const newShapes = shapes
      .slice(0, this.players.length)
      .shuffle()
      .$;

    players.forEach((player, i) => {
      player.data.shape = newShapes[i];
    });
  }
}

module.exports = VirusWarGame;
