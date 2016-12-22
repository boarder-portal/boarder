const D = require('dwayne');
const Game = require('./');
const {
  games: {
    set: {
      events: {
        game: {
          FIND_SET,
          NO_SET_HERE,
          ADD_CARDS
        }
      },
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
  static listeners = {
    [FIND_SET]: {
      listener: 'onFindSet'
    },
    [NO_SET_HERE]: {
      listener: 'onNoSetHere'
    }
  };

  prepareGame() {
    super.prepareGame();

    const remainingCards = this.remainingCards = cards
      .slice()
      .shuffle();

    this.field = array(12, (i) => (
      D(remainingCards.pop()).assign({
        i,
        x: i % 4,
        y: Math.floor(i / 4)
      }).$
    )).$;

    this.startGame();
  }

  onFindSet([i1, i2, i3], socket) {
    const {
      field,
      remainingCards
    } = this;
    const { player } = socket;
    const card1 = field[i1];
    const card2 = field[i2];
    const card3 = field[i3];
    const cards = [card1, card2, card3];
    const isSet = this.isSet(cards);
    const additionalCards = [];
    const cardsToChange = [];

    if (isSet) {
      player.score++;

      // normal situation: when the cards deck is not empty and there are exactly 12 cards on the table
      if (remainingCards.length && field.length === 12) {
        const newCard1 = remainingCards.pop();
        const newCard2 = remainingCards.pop();
        const newCard3 = remainingCards.pop();

        D(card1).assign(newCard1);
        D(card2).assign(newCard2);
        D(card3).assign(newCard3);

        additionalCards.push(...cards);
      // when there are still cards in the deck and there are more than 12 cards on the table
      } else if (field.length > 12) {
        const lastCards = field.splice(field.length - 3);
        const lastCardsInPlay = lastCards.filter((card) => cards.indexOf(card) === -1);
        const matchedNotLastCards = cards.filter((card) => lastCards.indexOf(card) === -1);

        matchedNotLastCards.forEach((card, i) => {
          D(card)
            .assign(lastCardsInPlay[i])
            .assign({
              x: card.x,
              y: card.y
            });
        });
        cardsToChange.push(...matchedNotLastCards);
      // when there are no more cards in the deck
      } else {
        field.splice(field.indexOf(card1));
        field.splice(field.indexOf(card2));
        field.splice(field.indexOf(card3));
      }
    }

    this.emit(FIND_SET, {
      cards,
      isSet,
      additionalCards,
      cardsToChange
    }, isSet);
  }

  isSet([
    {
      shape: shape1,
      color: color1,
      fillType: fillType1,
      count: count1
    },
    {
      shape: shape2,
      color: color2,
      fillType: fillType2,
      count: count2
    },
    {
      shape: shape3,
      color: color3,
      fillType: fillType3,
      count: count3
    }
  ]) {
    return (
      (
        (shape1 === shape2 && shape1 === shape3)
        || (shape1 !== shape2 && shape2 !== shape3 && shape3 !== shape1)
      ) && (
        (color1 === color2 && color1 === color3)
        || (color1 !== color2 && color2 !== color3 && color3 !== color1)
      ) && (
        (fillType1 === fillType2 && fillType1 === fillType3)
        || (fillType1 !== fillType2 && fillType2 !== fillType3 && fillType3 !== fillType1)
      ) && (
        (count1 === count2 && count1 === count3)
        || (count1 !== count2 && count2 !== count3 && count3 !== count1)
      )
    );
  }
}

module.exports = SetGame;
