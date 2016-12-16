const D = require('dwayne');
const {
  games: {
    global: {
      events: {
        game: {
          PREPARING_GAME,
          GAME_STARTED,
          UPDATE_PLAYERS
        }
      }
    }
  },
  colors: colorsObject
} = require('../../config/constants.json');

const colors = D(colorsObject).keys();

/**
 * @class Game
 * @public
 */
class Game {
  static listeners = {};

  constructor(props) {
    D(this).assign(props);

    this.prepareGame();
  }

  emit() {
    this.socket.emit(...arguments);
  }

  prepareGame() {
    this.emit(PREPARING_GAME);

    this.turn = 0;
    this.players
      .shuffle()
      .forEach((player) => {
        player.score = 0;
      });
  }

  setColors() {
    const { players } = this;
    const newColors = colors
      .slice(0, players.length)
      .shuffle()
      .$;

    players.forEach((player, i) => {
      player.color = newColors[i];
    });
  }

  startGame() {
    this.emit(GAME_STARTED, this);
  }

  isSocketActivePlayer(socket) {
    const { player } = socket;

    return this.players.$[this.turn].login === player.login;
  }

  changeTurn(isNeededToUpdatePlayers) {
    const oldTurn = this.turn;

    this.turn = ++this.turn === this.players.length
      ? 0
      : this.turn;

    this.players.$[oldTurn].active = false;
    this.players.$[this.turn].active = true;

    if (isNeededToUpdatePlayers) {
      this.updatePlayers();
    }
  }

  updatePlayers() {
    this.emit(UPDATE_PLAYERS, this.players);
  }

  toJSON() {
    const {
      field,
      turn,
      players,
      options
    } = this;

    return {
      field,
      turn,
      players,
      options
    };
  }
}

module.exports = Game;
