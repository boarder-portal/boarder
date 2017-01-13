const D = require('dwayne');
const {
  games: {
    global: {
      events: {
        game: {
          PREPARING_GAME,
          GAME_STARTED,
          GAME_FINISHING,
          UPDATE_PLAYERS,
          UPDATE_GAME
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

  emit(event, data, isNeededToUpdatePlayers) {
    const dataObject = {
      event,
      data
    };

    if (isNeededToUpdatePlayers) {
      dataObject.players = this.players;
    }

    this.pureEmit(UPDATE_GAME, dataObject);
  }

  pureEmit() {
    this.socket.emit(...arguments);
  }

  prepareGame() {
    this.pureEmit(PREPARING_GAME);

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
    this.pureEmit(GAME_STARTED, this);
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

  finishGame() {
    this.pureEmit(GAME_FINISHING, this.players);
    this.room.finishGame(this.players);
  }

  updatePlayers() {
    this.pureEmit(UPDATE_PLAYERS, this.players);
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
