import { D, Block, doc } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

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

  backImage = '/public/images/pexeso/backs/default/0.jpg';

  constructor(opts) {
    super(opts);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.socket = this.args.socket;
    this.loaded = gameData.currentTurnedCards.length;
    this.options = gameData.options;

    emitter.on(TURN_CARD, this.onTurnCard);
  }

  afterConstruct() {
    this.watch('args.gameData', this.setup);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setup = () => {
    const { gameData } = this.args;

    if (!gameData) {
      return;
    }

    this.field = gameData.field;
    this.turn = gameData.turn;
    this.currentTurnedCards = gameData.currentTurnedCards;
    this.match = gameData.match;

    this.tryToCloseCards();
  };

  turnCard(card) {
    if (!this.args.isMyTurn || !card.isInPlay || card.isTurned || this.currentTurnedCards.length >= 2) {
      return;
    }

    const { x, y } = card;

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

  tryToCloseCards() {
    if (this.loaded < 2) {
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
              ? { beforeNotInPlay: true }
              : { opened: true }
          );
        });
      });
  }

  onTurnCard = ({ x, y, match }) => {
    const { currentTurnedCards } = this;

    currentTurnedCards.push({ x, y });

    this.match = match;

    doc
      .img()
      .ref(this.constructImageURL(this.field[y][x]))
      .load()
      .then(() => {
        this.changeCard(x, y, {
          opened: true
        });

        this.loaded++;

        this.tryToCloseCards();
      });
  };

  onTransitionEnd(card) {
    this.changeCard(card.x, card.y, {
      isTurned: card.opened ? !card.isTurned : card.isTurned,
      opened: false,
      isInPlay: card.beforeNotInPlay ? false : card.isInPlay
    });
  }

  constructImageURL(card) {
    const { options } = this;

    return `/public/images/pexeso/sets/${ options.set }/${ card.card }.jpg`;
  }
}

Block.block('Pexeso', Pexeso);
