const _ = require('lodash');
const Game = require('./');
const {
  games: {
    pexeso: {
      TRANSITION_DURATION,
      CARD_SHOWN_DURATION,
      events: {
        game: {
          TURN_CARD
        }
      }
    }
  }
} = require('../../config/constants.json');
const SLEEP_DURATION = CARD_SHOWN_DURATION + 4 * TRANSITION_DURATION;

const SETS_COUNT = 30;
const CARDS_ARRAY = _.times(SETS_COUNT).concat(_.times(SETS_COUNT));

/**
 * @class PexesoGame
 * @extends Game
 * @public
 */
class PexesoGame extends Game {
  static listeners = {
    [TURN_CARD]: {
      forActivePlayer: true,
      listener: 'onTurnCard'
    }
  };

  prepareGame() {
    super.prepareGame();

    const newCards = _.shuffle(CARDS_ARRAY);

    this.sleepMode = false;
    this.currentTurnedCards = [];
    this.allTurnedCardsCount = 0;
    this.field = _.times(6, (y) => (
      _.times(10, (x) => ({
        x,
        y,
        isInPlay: true,
        isTurned: false,
        card: newCards.pop() + 1
      }))
    ));
    this.players[0].active = true;

    this.startGame();
  }

  onTurnCard(data) {
    const { x, y } = data;
    const { currentTurnedCards } = this;
    const card = this.field[y][x];

    if (this.sleepMode || !card.isInPlay || card.isTurned) {
      return;
    }

    currentTurnedCards.push(card);
    card.isTurned = true;

    const [card1, card2] = currentTurnedCards;
    const match = this.match = card2 && card1.card === card2.card;

    this.emit(TURN_CARD, {
      x,
      y,
      match
    });

    if (currentTurnedCards.length === 2) {
      this.sleepMode = true;
      this.currentTurnedCards = [];

      currentTurnedCards.forEach((card) => {
        if (match) {
          card.isInPlay = false;
        } else {
          card.isTurned = false;
        }
      });

      setTimeout(() => {
        this.sleepMode = false;

        if (match) {
          player.score++;
          this.updatePlayers();

          if (++this.allTurnedCardsCount >= setsCount) {
            this.finishGame();
          }
        } else {
          this.changeTurn(true);
        }
      }, SLEEP_DURATION);
    }
  }

  toJSON() {
    const {
      currentTurnedCards,
      match
    } = this;

    return {
      ...super.toJSON(),
      currentTurnedCards,
      match
    };
  }
}

module.exports = PexesoGame;
