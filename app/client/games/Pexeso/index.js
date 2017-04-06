import _ from 'lodash';
import { Block, doc } from 'dwayne';
import template from './index.pug';
import Game from '../';
import { timeout } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  pexeso: {
    TRANSITION_DURATION,
    CARD_SHOWN_DURATION,
    events: {
      game: {
        TURN_CARD
      }
    }
  }
} = gamesConfig;

class Pexeso extends Game {
  static template = template();
  static listeners = {
    [TURN_CARD]: 'onTurnCard'
  };

  backImage = '/public/images/pexeso/backs/default/0.jpg';

  constructor(opts) {
    super(opts);

    const { gameData } = this;

    this.loaded = gameData.currentTurnedCards.length;
    this.options = gameData.options;

    _.times(30, (i) => {
      doc
        .img()
        .ref(this.constructImageURL({ card: i }));
    });
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

  closeCards(promise, match) {
    const { currentTurnedCards } = this;

    promise
      .then(() => timeout(CARD_SHOWN_DURATION))
      .then(() => {
        _.forEach(currentTurnedCards, ({ x, y }) => {
          this.changeCard(
            x,
            y,
            match
              ? { isFading: true }
              : { isShrinking: true }
          );
        });

        if (match) {
          timeout(2 * TRANSITION_DURATION).then(() => {
            this.currentTurnedCards = [];

            _.forEach(currentTurnedCards, ({ x, y }) => {
              this.changeCard(x, y, {
                isInPlay: false
              });
            });
          });
        } else {
          timeout(TRANSITION_DURATION)
            .then(() => {
              _.forEach(currentTurnedCards, ({ x, y }) => {
                this.changeCard(x, y, {
                  isShrinking: false,
                  isTurned: false
                });
              });

              return timeout(TRANSITION_DURATION);
            })
            .then(() => {
              this.currentTurnedCards = [];
            });
        }
      });
  }

  onTurnCard = ({ x, y, match }) => {
    const { currentTurnedCards } = this;

    currentTurnedCards.push({ x, y });

    this.changeCard(x, y, {
      isShrinking: true
    });

    const promise = timeout(TRANSITION_DURATION).then(() => {
      this.changeCard(x, y, {
        isShrinking: false,
        isTurned: true
      });

      return timeout(TRANSITION_DURATION);
    });

    if (currentTurnedCards.length < 2) {
      return;
    }

    this.closeCards(promise, match);
  };

  constructImageURL(card) {
    const { options } = this;

    return `/public/images/pexeso/sets/${ options.set }/${ card.card }.jpg`;
  }
}

Block.block('Pexeso', Pexeso);
