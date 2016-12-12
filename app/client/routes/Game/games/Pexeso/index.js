import { D, Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../../../config/constants.json';

const {
  pexeso: {
    events: {
      game: {
        TURN_CARD,
        CARDS_LOADED
      }
    }
  }
} = gamesConfig;

class Pexeso extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const gameData = this.gameData = this.args.gameData;
    const socket = this.socket = this.args.socket;

    this.field = gameData.field;
    this.turn = gameData.turn;
    this.players = gameData.players;
    this.currentTurnedCards = gameData.currentTurnedCards;
    this.loaded = 0;
    this.match = gameData.match;

    socket.on(TURN_CARD, this.onTurnCard);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  turnCard(x, y) {
    const card = this.field[y][x];

    if (!this.args.isMyTurn() || !card.isInPlay || card.isTurned || this.currentTurnedCards.length >= 2) {
      return;
    }

    this.emit(TURN_CARD, { x, y });
  }

  changeCard(x, y, card) {
    const { field } = this;

    this.field = [
      ...field.slice(0, y),
      [
        ...field[y].slice(0, x),
        {
          ...field[y][x],
          ...card
        },
        ...field[y].slice(x + 1)
      ],
      ...field.slice(y + 1)
    ];
  }

  onTurnCard = ({ x, y, match }) => {
    this.currentTurnedCards.push({ x, y });
    this.changeCard(x, y, {
      isTurned: true
    });
    this.match = match;
  };

  onCardLoaded = ({ target }) => {
    if (D(target).attr('image') === 'false') {
      return;
    }

    if (++this.loaded !== 2) {
      return;
    }

    const { currentTurnedCards } = this;

    this.emit(CARDS_LOADED);

    D(2000)
      .timeout()
      .then(() => {
        this.loaded = 0;
        this.currentTurnedCards = D([]);

        currentTurnedCards.forEach(({ x, y }) => {
          this.changeCard(
            x,
            y,
            this.match
              ? { isInPlay: false }
              : { isTurned: false }
          );
        });
      });
  };
}

Block.register('Pexeso', Pexeso);
