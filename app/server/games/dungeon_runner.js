const Game = require('./');
const {
  games: {
    dungeon_runner: {
      events: {
        game: {
          CHANGE_BUTTON_STATUS
        }
      }
    }
  }
} = require('../../config/constants.json');

class DungeonRunnerGame extends Game {
  static listeners = {
    [CHANGE_BUTTON_STATUS]: {
      listener: 'onChangeButton'
    }
  };

  prepareGame() {
    super.prepareGame();

    setTimeout(() => {
      this.startGame();
    }, 3000);

    this.isButtonOn = false;
  }

  onChangeButton(data, socket) {
    const { player } = socket;

    this.isButtonOn = !this.isButtonOn;

    this.emit(CHANGE_BUTTON_STATUS, {
      buttonStatus: this.isButtonOn
    });
  }

  toJSON() {
    const { isButtonOn } = this;

    return {
      ...super.toJSON(),
      isButtonOn
    };
  }
}

module.exports = DungeonRunnerGame;
