const D = require('dwayne');
const { io } = require('../');
const Player = require('./Player');
const {
  socketSession,
  socketAuth
} = require('../controllers/auth');
const {
  games: {
    global: {
      events: {
        room: {
          ENTER_ROOM,
          UPDATE_ROOM,
          TOGGLE_PLAYER_STATUS
        },
        game: {
          GAME_FINISHED
        }
      },
      roomStatuses: {
        NOT_PLAYING,
        PLAYING,
        FINISHING
      },
      playerRoles: {
        PLAYER,
        OBSERVER
      }
    }
  }
} = require('../../config/constants.json');
const { ROOM_DESTRUCTION_DELAY } = require('../constants/index');

const {
  array,
  isNull,
  method
} = D;
const disconnect = method('disconnect');

/**
 * @class Room
 * @public
 */
class Room {
  /**
   * @member {String} Room#id
   * @public
   */
  /**
   * @member {String} Room#name
   * @public
   */
  /**
   * @member {Number} Room#status
   * @public
   */
  /**
   * @member {Arr} Room#players
   * @public
   */
  /**
   * @member {Arr} Room#observers
   * @public
   */
  /**
   * @member {Lobby} Room#lobby
   * @public
   */
  /**
   * @member {Namespace} Room#room
   * @public
   */
  /**
   * @member {Number} Room#_expires
   * @protected
   */
  /**
   * @member {Promise} Room#_timeout
   * @protected
   */

  constructor(props) {
    const {
      id,
      roomNsp,
      playersCount,
      _expires = ROOM_DESTRUCTION_DELAY
    } = props;
    const socket = io.of(roomNsp.replace(/\$roomId/, id));
    const timeout = D(0).timeout();

    timeout.catch(() => {});

    D(this).assign({
      status: NOT_PLAYING,
      players: array(playersCount, () => null),
      observers: D({}),
      socket,
      _timeout: timeout
    }, props, {
      _expires
    });

    this.expires();

    socket.use(socketSession);
    socket.use(socketAuth);
    socket.on('connection', this.userEnter);
  }

  /**
   * @method Room#delete
   * @public
   */
  delete() {
    const {
      lobby,
      socket
    } = this;

    const { connected } = socket;
    const sockets = D(connected);

    socket.removeAllListeners();

    while (connected.length) {
      sockets.forEach(disconnect);
    }

    lobby.deleteRoom(this);
  }

  /**
   * @method Room#expires
   * @public
   * @param {Number} [time = this._expires]
   */
  expires(time) {
    const {
      _timeout,
      _expires
    } = this;

    time = time || _expires;

    _timeout.abort();

    if (time === Infinity) {
      return;
    }

    const timeout = this._timeout = D(time).timeout();

    timeout
      .then(() => this.delete(), () => {})
      .catch(() => {});
  }

  /**
   * @method Room#finishGame
   * @public
   */
  finishGame() {
    this.status = FINISHING;

    D(5000)
      .timeout()
      .then(() => {
        this.game = null;
        this.status = NOT_PLAYING;
        this.players.forEach((player) => {
          if (player) {
            player.setInitialGameState();
          }
        });
        this.update();
        this.socket.emit(GAME_FINISHED);
      });
  }

  /**
   * @method Room#isRequiredPlayers
   * @public
   * @returns {Boolean}
   */
  isRequiredPlayers() {
    const { players } = this;

    return players.sum((player) => !isNull(player)) > 1;
  }

  /**
   * @method Room#toogleUserStatus
   * @public
   * @param {Player} player
   */
  togglePlayerStatus(player) {
    player.ready = !player.ready;

    this.update();
    this.tryToStartGame();
  }

  tryToStartGame() {
    const {
      players,
      socket,
      Game,
      gameOptions
    } = this;

    if (players.every(isReady) && this.isRequiredPlayers()) {
      this.game = new Game({
        socket,
        room: this,
        players: players.filter(Boolean),
        options: gameOptions
      });
      this.status = PLAYING;
    }
  }

  /**
   * @method Room#update
   * @public
   * @param {Socket} [playerSocket]
   */
  update(playerSocket) {
    const {
      lobby,
      socket
    } = this;
    const channel = playerSocket ? playerSocket.broadcast : socket;

    lobby.updateRoom(this);
    channel.emit(UPDATE_ROOM, this);
  }

  /**
   * @method Room#userEnter
   * @param {Socket} socket
   */
  userEnter = (socket) => {
    console.log(`entering room #${ this.id } (${ socket.id.slice(socket.id.indexOf('#')) })`);

    if (socket.player) {
      return;
    }

    this.expires(Infinity);

    socket.room = this;
    socket.on('disconnect', () => this.userLeave(socket));

    const {
      id,
      handshake: {
        query: { role }
      },
      user
    } = socket;
    const {
      players,
      observers,
      Game,
      game
    } = this;
    const { value: existentPlayer } = players.find((player) => player && player.login === user.login) || {};
    const planningRole = role === 'observer' || (game && !existentPlayer) ? OBSERVER : PLAYER;
    const isGoingToBePlayer = planningRole === PLAYER;
    let eventualRole = planningRole;
    let eventualPlayer = existentPlayer;

    if (
      (!game && (!existentPlayer || !isGoingToBePlayer)) ||
      (game && !isGoingToBePlayer)
    ) {
      const { key = null } = players.find(isNull) || {};
      const willBePlayer = !isNull(key) && isGoingToBePlayer;

      eventualRole = willBePlayer ? PLAYER : OBSERVER;
      eventualPlayer = new Player({
        login: user.login,
        avatar: user.avatar,
        room: this
      });

      if (willBePlayer) {
        eventualPlayer.index = key;
        players.$[key] = eventualPlayer;
      } else {
        observers.$[id] = true;
      }

      this.update(socket);
    }

    eventualPlayer.sockets.$[id] = true;

    socket.role = eventualRole;
    socket.player = eventualPlayer;
    socket.emit(ENTER_ROOM, {
      role: eventualRole,
      room: this
    });

    if (eventualRole === PLAYER) {
      socket.on(TOGGLE_PLAYER_STATUS, () => this.togglePlayerStatus(eventualPlayer));

      D(Game.listeners).forEach(({ forActivePlayer, listener }, event) => {
        socket.on(event, (data) => {
          if (this.status === PLAYING) {
            if (!forActivePlayer || this.game.isSocketActivePlayer(socket)) {
              this.game[listener](data, socket);
            }
          }
        });
      });
    }
  };

  /**
   * @method Room#userLeave
   * @public
   * @param {Socket} socket
   */
  userLeave(socket) {
    const {
      id,
      room: {
        status,
        players,
        observers
      },
      player: {
        index,
        sockets
      },
      role
    } = socket;

    if (role === PLAYER && status === NOT_PLAYING) {
      sockets.delete(id);

      if (!sockets.count) {
        players.$[index] = null;

        this.update();
        this.tryToStartGame();
      }
    } else if (role === OBSERVER) {
      observers.delete(id);

      this.update();
    }

    if (players.every(isNull) && !observers.count) {
      this.expires();
    }

    console.log(`leaving  room #${ this.id } (${ socket.id.slice(socket.id.indexOf('#')) })`);
  }

  toJSON() {
    const {
      id,
      name,
      game,
      playersCount,
      status,
      players,
      observers,
      gameOptions
    } = this;

    return {
      id,
      name,
      game,
      playersCount,
      status,
      players,
      observers: observers.count,
      gameOptions
    };
  }
}

function isReady(player) {
  return !player || player.ready;
}

module.exports = Room;
