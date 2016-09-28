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

    const { game } = this;

    game.emit(PREPARING_GAME);
    game.emit(GAME_STARTED, this);
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
