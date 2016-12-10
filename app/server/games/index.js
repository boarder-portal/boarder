const D = require('dwayne');
const {
  games: {
    global: {
      events: {
        game: {
          PREPARING_GAME,
          GAME_STARTED
        }
      }
    }
  }
} = require('../../config/constants.json');

/**
 * @class Game
 * @public
 */
class Game {
  constructor(props) {
    D(this).assign(props);

    this.emit(PREPARING_GAME);
    this.emit(GAME_STARTED, this);
  }

  emit() {
    this.game.emit(...arguments);
  }

  toJSON() {
    const {
      players
    } = this;

    return {
      players
    };
  }
}

module.exports = Game;
