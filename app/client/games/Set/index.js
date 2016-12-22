import { D, Block } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  set: {
    events: {
      game: {
        FIND_SET,
        NO_SET_HERE,
        ADD_CARDS
      }
    }
  }
} = gamesConfig;

class SetGame extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const {
      gameData,
      emitter,
      socket
    } = this.args;

    this.ableToClick = true;
    this.socket = socket;
    this.selectedCards = D([]);

    this.setup();

    emitter.on(FIND_SET, this.onFindSet);
    emitter.on(ADD_CARDS, this.onAddCards);
  }

  afterConstruct() {
    this.watchArgs('gameData', this.setup);
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
    this.selectedCards.forEach(({ x, y, selected }) => {
      this.changeCard(x, y, { selected });
    });
  };

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

  clickCard(card) {
    if (!this.ableToClick) {
      return;
    }

    const { selectedCards } = this;

    if (card.isSelected) {
      const found = selectedCards.find(({ x, y }) => card.x === x && card.y === y);

      if (found) {
        selectedCards.splice(found.key, 1);
      }
    } else {
      selectedCards.push({
        x: card.x,
        y: card.y
      });
    }

    this.changeCard(card.x, card.y, {
      isSelected: !card.isSelected
    });

    if (this.selectedCards.length === 3) {
      this.ableToClick = false;
      this.emit(FIND_SET, this.selectedCards);
    }
  }

  onFindSet = ({ cards, isSet, additionalCards, cardsToChange }) => {

  };

  onAddCards = (cards) => {

  };
}

Block.register('SetGame', SetGame);

export default SetGame;
