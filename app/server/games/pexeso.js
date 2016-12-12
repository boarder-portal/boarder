const D = require('dwayne');
const Game = require('./');
const {
  games: {
    pexeso: {
      events: {
        game: {
          TURN_CARD,
          CARDS_LOADED
        }
      }
    }
  }
} = require('../../config/constants.json');

const { array } = D;

const cards = array(30);

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
    },
    [CARDS_LOADED]: {
      listener: 'onCardsLoaded'
    }
  };

  prepareGame() {
    super.prepareGame();

    let i = 0;
    const newCards = D(cards)
      .concat(cards)
      .shuffle()
      .$;

    this.areAllTurned = false;
    this.currentLoadedPlayersCards = {};
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

  onTurnCard(data) {
    const { x, y } = data;
    const { currentTurnedCards } = this;
    const card = this.field[y][x];

    if (!card.isInPlay || card.isTurned || currentTurnedCards.length >= 2) {
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
      this.areAllTurned = true;
    }
  }

  onCardsLoaded(data, socket) {
    if (!this.areAllTurned) {
      return;
    }

    const { currentLoadedPlayersCards } = this;

    currentLoadedPlayersCards[socket.player.login] = true;

    if (D(currentLoadedPlayersCards).count !== this.players.length) {
      return;
    }

    const {
      currentTurnedCards,
      match
    } = this;
    const player = this.players.$[this.turn];

    this.areAllTurned = false;

    D(2000)
      .timeout()
      .then(() => {
        this.currentTurnedCards = [];
        this.currentLoadedPlayersCards = {};

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
