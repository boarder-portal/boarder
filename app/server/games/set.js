import _ from 'lodash';

import Game from './';
import { games } from '../../shared/constants';

const {
  events: {
    game: {
      FIND_SET,
      NO_SET_HERE
    }
  },
  shapesTypes: shapesTypesObject,
  colors: colorsObject,
  fillTypes: fillTypesObject
} = games.set;

const shapesTypes = _.keys(shapesTypesObject);
const colors = _.keys(colorsObject);
const fillTypes = _.keys(fillTypesObject);
const countTypes = _.times(3, (n) => n + 1);
const cards = [];

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

    const remainingCards = this.remainingCards = _.shuffle(cards.map(_.clone));

    this.field = _.times(12, (i) => (
      _.assign(remainingCards.pop(), {
        index: i,
        x: Math.floor(i / 3),
        y: i % 3
      })
    ));

    this.startGame();
  }

  onFindSet([index1, index2, index3], socket) {
    const {
      field,
      remainingCards
    } = this;
    const { player } = socket;
    const card1 = field[index1];
    const card2 = field[index2];
    const card3 = field[index3];
    const cards = [card1, card2, card3];
    const isSet = this.isSet(cards);
    let additionalCards = [];
    let cardsToMove = [];

    if (!card1 || !card2 || !card3) {
      return;
    }

    if (isSet) {
      player.score++;

      // normal situation: when the cards deck is not empty and there are exactly 12 cards on the table
      if (remainingCards.length && field.length === 12) {
        const newCard1 = remainingCards.pop();
        const newCard2 = remainingCards.pop();
        const newCard3 = remainingCards.pop();

        _.assign(card1, newCard1);
        _.assign(card2, newCard2);
        _.assign(card3, newCard3);

        additionalCards = cards;
      // when there are still cards in the deck and there are more than 12 cards on the table
      } else if (field.length > 12) {
        const lastCards = [
          field.pop(),
          field.pop(),
          field.pop()
        ].reverse();
        const lastCardsInPlay = lastCards.filter((card) => cards.indexOf(card) === -1);
        const matchedNotLastCards = cards.filter((card) => lastCards.indexOf(card) === -1);

        matchedNotLastCards.forEach((card, i) => {
          const {
            index,
            x,
            y
          } = card;

          _.assign(card, lastCardsInPlay[i], {
            index,
            x,
            y
          });
        });
        cardsToMove = lastCardsInPlay.map((card, i) => {
          const {
            index,
            x,
            y
          } = matchedNotLastCards[i];

          return {
            ...card,
            oldIndex: card.index,
            index,
            x,
            y
          };
        });
      // when there are no more cards in the deck
      } else {
        field[field.indexOf(card1)] = null;
        field[field.indexOf(card2)] = null;
        field[field.indexOf(card3)] = null;
      }
    } else {
      player.score--;
    }

    this.emit(FIND_SET, {
      cards: [index1, index2, index3],
      cardsLeft: remainingCards.length,
      isSet,
      additionalCards,
      cardsToMove
    }, true);
  }

  onNoSetHere(data, socket) {
    const {
      field,
      remainingCards
    } = this;
    const { player } = socket;
    const cards = field.filter(Boolean);
    const isThereSet = cards.slice(0, -2).some((card1, i1) => (
      cards.slice(i1 + 1, -1).some((card2, i2) => (
        cards.slice(i1 + i2 + 2).some((card3) => (
          this.isSet([card1, card2, card3])
        ))
      ))
    ));
    let additionalCards = [];

    if (isThereSet) {
      player.score -= 0.5;
    } else {
      player.score += 0.5;

      if (remainingCards.length) {
        const { length } = this.field;
        const x = Math.round(length / 3);
        const newCard1 = remainingCards.pop();
        const newCard2 = remainingCards.pop();
        const newCard3 = remainingCards.pop();

        _.assign(newCard1, {
          index: length,
          x,
          y: 0
        });
        _.assign(newCard2, {
          index: length + 1,
          x,
          y: 1
        });
        _.assign(newCard3, {
          index: length + 2,
          x,
          y: 2
        });
        field.push(newCard1, newCard2, newCard3);

        additionalCards = [
          newCard1,
          newCard2,
          newCard3
        ];
      } else {
        this.finishGame();
      }
    }

    this.emit(NO_SET_HERE, {
      cardsLeft: remainingCards.length,
      additionalCards
    }, true);
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

  toJSON() {
    const { remainingCards } = this;

    return {
      ...super.toJSON(),
      cardsLeft: remainingCards.length
    };
  }
}

export default SetGame;
