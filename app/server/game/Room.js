const _ = require('lodash');
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

const isNotNull = _.negate(_.isNull);
const disconnect = _.method('disconnect');
const PUBLIC_FIELDS = [
  'id',
  'name',
  'game',
  'playersCount',
  'status',
  'players',
  'observersCount',
  'gameOptions'
];

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
   * @member {Player[]} Room#players
   * @public
   */
  /**
   * @member {String[]} Room#observers
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
   * @member {Number} Room#_timeout
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

    _.assign(this, {
      status: NOT_PLAYING,
      players: _.times(playersCount, () => null),
      observers: {},
      observersCount: 0,
      socket,
      _timeout: setTimeout(_.noop, 0)
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
  delete = () => {
    const {
      lobby,
      socket
    } = this;

    const { connected } = socket;

    socket.removeAllListeners();

    while (connected.length) {
      _.forEach(connected, disconnect);
    }

    lobby.deleteRoom(this);
  };

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

    clearTimeout(_timeout);

    if (time === Infinity) {
      return;
    }

    this._timeout = setTimeout(this.delete, time);
  }

  /**
   * @method Room#finishGame
   * @public
   */
  finishGame() {
    const {
      players,
      socket
    } = this;

    this.status = FINISHING;

    this.update();

    setTimeout(() => {
      this.game = null;
      this.status = NOT_PLAYING;

      players.forEach((player, i) => {
        if (player) {
          if (_.isEmpty(player.sockets)) {
            players[i] = null;
          } else {
            player.setInitialGameState();
          }
        }
      });
      this.update();
      this.tryToRemoveRoom();
      socket.emit(GAME_FINISHED);
    }, 5000);
  }

  /**
   * @method Room#isRequiredPlayers
   * @public
   * @returns {Boolean}
   */
  isRequiredPlayers() {
    const { players } = this;

    return players.filter(isNotNull).length > 1;
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

  tryToRemoveRoom() {
    const {
      players,
      observers
    } = this;

    if (players.every(_.isNull) && _.isEmpty(observers)) {
      this.expires();
    }
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
    const existentPlayer = players.find((player) => player && player.login === user.login);
    const planningRole = role === 'observer' || (game && !existentPlayer) ? OBSERVER : PLAYER;
    const isGoingToBePlayer = planningRole === PLAYER;
    let eventualRole = planningRole;
    let eventualPlayer = existentPlayer;

    if (
      (!game && (!existentPlayer || !isGoingToBePlayer)) ||
      (game && !isGoingToBePlayer)
    ) {
      const index = _.findIndex(players, _.isNull);
      const willBePlayer = index !== -1 && isGoingToBePlayer;

      eventualRole = willBePlayer ? PLAYER : OBSERVER;
      eventualPlayer = new Player({
        login: user.login,
        avatar: user.avatar,
        room: this
      });

      if (willBePlayer) {
        eventualPlayer.index = index;
        players[index] = eventualPlayer;
      } else {
        observers[id] = true;
        this.observersCount++;
      }

      this.update(socket);
    }

    eventualPlayer.sockets[id] = true;

    socket.role = eventualRole;
    socket.player = eventualPlayer;
    socket.emit(ENTER_ROOM, {
      role: eventualRole,
      room: this
    });

    if (eventualRole === PLAYER) {
      socket.on(TOGGLE_PLAYER_STATUS, () => this.togglePlayerStatus(eventualPlayer));

      _.forEach(Game.listeners, ({ forActivePlayer, listener }, event) => {
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

    if (role === PLAYER) {
      delete sockets[id];

      if (_.isEmpty(sockets) && status === NOT_PLAYING) {
        players[index] = null;

        this.update();
        this.tryToStartGame();
      }
    } else if (role === OBSERVER) {
      delete observers[id];
      this.observersCount--;

      this.update();
    }

    this.tryToRemoveRoom();

    console.log(`leaving  room #${ this.id } (${ socket.id.slice(socket.id.indexOf('#')) })`);
  }

  toJSON() {
    return _.pick(this, PUBLIC_FIELDS);
  }
}

function isReady(player) {
  return !player || player.ready;
}

module.exports = Room;
