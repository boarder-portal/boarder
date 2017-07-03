const _ = require('lodash');
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
  colors
} = require('../../config/constants.json');

const COLORS = _.keys(colors);
const PUBLIC_FIELDS = [
  'field',
  'turn',
  'players',
  'options'
];

/**
 * @class Game
 * @public
 */
class Game {
  static listeners = {};

  constructor(props) {
    _.assign(this, props);

    setTimeout(() =>this.prepareGame(), 0);
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
    this.players = _(this.players)
      .shuffle()
      .forEach((player) => {
        player.score = 0;
      });
  }

  setColors() {
    const { players } = this;
    const colors = _.shuffle(COLORS);

    players.forEach((player, i) => {
      player.color = colors[i];
    });
  }

  startGame() {
    this.pureEmit(GAME_STARTED, this);
  }

  isSocketActivePlayer(socket) {
    const { player } = socket;

    return this.players[this.turn].login === player.login;
  }

  changeTurn(isNeededToUpdatePlayers) {
    const oldTurn = this.turn;

    this.turn = ++this.turn === this.players.length
      ? 0
      : this.turn;

    this.players[oldTurn].active = false;
    this.players[this.turn].active = true;

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
    return _.pick(this, PUBLIC_FIELDS);
  }
}

module.exports = Game;
