const D = require('dwayne');
const Game = require('./');
const {
  games: {
    set: {
      shapesTypes: shapesTypesObject,
      colors: colorsObject,
      fillTypes: fillTypesObject
    }
  }
} = require('../../config/constants.json');

const { array } = D;
const shapesTypes = D(shapesTypesObject).keys();
const colors = D(colorsObject).keys();
const fillTypes = D(fillTypesObject).keys();
const countTypes = array(3, (n) => n + 1);
const cards = D([]);

shapesTypes.forEach((shape) => {
  colors.forEach((color) => {
    fillTypes.forEach((fillType) => {
      countTypes.forEach((count) => {
        cards.push({
          shape,
          color,
          fillType,
          count
        });
      });
    });
  });
});

/**
 * @class SetGame
 * @extends Game
 * @public
 */
class SetGame extends Game {
  prepareGame() {
    super.prepareGame();

    const remainingCards = cards
      .slice()
      .shuffle();

    this.field = array(3, (y) => (
      array(4, (x) => ({
        x,
        y,
        ...remainingCards.pop()
      }))
    )).$;

    this.startGame();
  }
}

module.exports = SetGame;
