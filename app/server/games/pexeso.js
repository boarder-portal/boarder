const D = require('dwayne');
const Game = require('./');
const {
  games: {
    pexeso: {
      events: {
        game: {
          TURN_CARD
        }
      }
    }
  }
} = require('../../config/constants.json');

const { array } = D;

const cards = array(30);

const colors = [
  'red',
  'green',
  'blue',
  'yellow',
  'orange',
  'purple',
  'pink',
  'lime'
];

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

    let i = 0;
    const newCards = D(cards)
      .concat(cards)
      .shuffle()
      .$;

    this.currentTurnedCards = [];
    this.field = array(6, (y) => (
      array(10, (x) => ({
        x,
        y,
        isInPlay: true,
        isTurned: false,
        card: newCards[i++] + 1
      })).$
    )).$;
    this.players.$[0].active = true;

    this.startGame();
  }

  onTurnCard(data, socket) {
    const { player } = socket;
    const { x, y } = data;
    const { currentTurnedCards } = this;
    const card = this.field[y][x];

    console.log(card, currentTurnedCards);

    if (!card.isInPlay || card.isTurned || currentTurnedCards.length >= 2) {
      return;
    }

    currentTurnedCards.push(card);
    card.isTurned = true;

    const [card1, card2] = currentTurnedCards;
    const isLast = currentTurnedCards.length === 2;
    const match = card2 && card1.card === card2.card;

    this.emit(TURN_CARD, {
      x,
      y,
      isLast,
      match
    });

    if (!isLast) {
      return;
    }

    D(2000)
      .timeout()
      .then(() => {
        this.currentTurnedCards = [];

        currentTurnedCards.forEach((card) => {
          if (match) {
            card.isInPlay = false;
          } else {
            card.isTurned = false;
          }
        });

        if (match) {
          player.score++;
          this.updatePlayers();
        } else {
          this.changeTurn(true);
        }
      });
  }

  toJSON() {
    const { currentTurnedCards } = this;

    return {
      ...super.toJSON(),
      currentTurnedCards
    };
  }
}

module.exports = PexesoGame;
