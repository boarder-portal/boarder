import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import { gameWrapper } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  set: {
    events: {
      game: {
        FIND_SET,
        NO_SET_HERE
      }
    }
  }
} = gamesConfig;

class SetGame extends Block {
  static template = template();
  static listeners = {
    [FIND_SET]: 'onFindSet',
    [NO_SET_HERE]: 'onNoSetHere'
  };

  CARD_WIDTH = 105;
  CARD_HEIGHT = 150;
  CARD_MARGIN = 6;

  ableToClick = true;
  selectedCards = [];

  setup = () => {
    const { gameData } = this.args;

    if (!gameData) {
      return;
    }

    this.cardsLeft = gameData.cardsLeft;
    this.field = gameData.field;

    _.forEach(this.selectedCards, (i) => {
      this.changeCard(i, { isSelected: true });
    });
  };

  changeCard(index, card) {
    const { field } = this;
    const i = _.findIndex(field, (card) => card && card.index === index);

    this.field = [
      ...field.slice(0, i),
      {
        ...field[i],
        ...card
      },
      ...field.slice(i + 1)
    ];
  }

  deleteCard = (index) => {
    const { field } = this;
    const i = _.findIndex(field, (card) => card && card.index === index);

    this.field = [
      ...field.slice(0, i),
      ...field.slice(i + 1)
    ];
  };

  addCard = (card) => {
    this.field = [
      ...this.field,
      card
    ];
  };

  clickCard(card) {
    if (!this.ableToClick) {
      return;
    }

    const { selectedCards } = this;

    if (card.isSelected) {
      const index = selectedCards.indexOf(card.index);

      if (index !== -1) {
        selectedCards.splice(index, 1);
      }
    } else {
      selectedCards.push(card.index);
    }
    this.changeCard(card.index, {
      isSelected: !card.isSelected
    });

    if (selectedCards.length === 3) {
      this.ableToClick = false;
      this.emit(FIND_SET, selectedCards);
    }
  }

  onTransitionEnd = () => {
    const {
      colorTransitionStarted,
      opacityTransitionStarted
    } = this;

    if (this.transitionsCount++) {
      if (this.transitionsCount === 3) {
        this.transitionsCount = 0;
      }

      return;
    }

    if (!colorTransitionStarted && !opacityTransitionStarted) {
      return;
    }

    const {
      cards,
      isSet
    } = this;

    if (this.colorTransitionStarted) {
      this.colorTransitionStarted = false;
      this.opacityTransitionStarted = true;

      return _.forEach(cards, (i) => {
        this.changeCard(i, {
          wrong: false,
          matched: isSet
        });
      });
    }

    this.opacityTransitionStarted = false;

    if (!this.isSet) {
      this.ableToClick = true;

      return;
    }

    const {
      additionalCards,
      cardsToMove,
      cardsLeftToSet
    } = this;

    if (!cardsToMove.length) {
      _.forEach(cards, this.deleteCard);
    }

    setTimeout(() => {
      this.ableToClick = true;
      this.cardsLeft = cardsLeftToSet;

      _.forEach(additionalCards, this.addCard);

      if (cardsToMove.length) {
        _.forEach(cards, this.deleteCard);
        _.forEach(cardsToMove, (card) => {
          this.changeCard(card.oldIndex, card);
        });
      }
    }, 500);
  };

  onFindSet = ({ cards, cardsLeft, isSet, additionalCards, cardsToMove }) => {
    const { selectedCards } = this;

    this.ableToClick = false;
    this.cardsLeftToSet = cardsLeft;
    this.isSet = isSet;
    this.additionalCards = additionalCards;
    this.cardsToMove = cardsToMove;
    this.cards = cards;
    this.colorTransitionStarted = true;
    this.transitionsCount = 0;

    _.forEach(cards, (i) => {
      this.changeCard(i, {
        isSelected: false,
        right: isSet,
        wrong: !isSet
      });

      const index = selectedCards.indexOf(i);

      if (index !== -1) {
        selectedCards.splice(index, 1);
      }
    });
  };

  add3Cards = () => {
    if (!this.ableToClick) {
      return;
    }

    this.emit(NO_SET_HERE);
  };

  onNoSetHere = ({ cardsLeft, additionalCards }) => {
    this.cardsLeft = cardsLeft;
    _.forEach(additionalCards, this.addCard);
  };
}

Block.block('SetGame', SetGame.wrap(gameWrapper));

export default SetGame;
