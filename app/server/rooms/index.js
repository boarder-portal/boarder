const D = require('dwayne');
const {
  socketSession,
  socketAuth
} = require('../controllers/auth');
const { io } = require('../index');
const {
  games: {
    global: {
      events: {
        room: {
          ENTER_ROOM,
          UPDATE_ROOM,
          TOGGLE_PLAYER_STATUS
        }
      },
      roomStatuses: { NOT_PLAYING },
      playerRoles: {
        PLAYER,
        OBSERVER
      }
    }
  }
} = require('../../config/constants.json');
const {
  constants: {
    ROOM_DESTRUCTION_DELAY
  }
} = require('../constants/index');

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
  /**
   * @member {String} Room#_roomNsp
   * @protected
   */

  constructor(props) {
    const { _roomNsp } = this;
    const {
      id,
      playersCount,
      _expires = ROOM_DESTRUCTION_DELAY
    } = props;
    const room = io.of(_roomNsp.replace(/\$roomId/, id));
    const timeout = D(0).timeout();

    timeout.catch(() => {});

    D(this).assign({
      status: NOT_PLAYING,
      players: array(playersCount, () => null),
      observers: D({}),
      room,
      _timeout: timeout
    }, props, {
      _expires
    });

    this.expires();

    room.use(socketSession);
    room.use(socketAuth);
    room.on('connection', this.userEnter.bind(this));
  }

  /**
   * @method Room#delete
   * @public
   */
  delete() {
    const {
      lobby,
      room
    } = this;

    const { connected } = room;
    const sockets = D(connected);

    room.removeAllListeners();

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

    const timeout = this._timeout = D(time)
      .timeout();

    timeout
      .then(() => this.delete(), () => {})
      .catch(() => {});
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
   * @method Room#update
   * @public
   * @param {Socket} [socket]
   */
  update(socket) {
    const {
      lobby,
      room
    } = this;
    const channel = socket ? socket.broadcast : room;

    lobby.updateRoom(this);
    channel.emit(UPDATE_ROOM, this);
  }

  /**
   * @method Room#userEnter
   * @param {Socket} socket
   */
  userEnter(socket) {
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
      Player,
      game
    } = this;
    const planningRole = role === 'observer' || game ? OBSERVER : PLAYER;
    const { value: existentPlayer } = players.find((player) => player && player.login === user.login) || {};
    const isGoingToBePlayer = planningRole === PLAYER;
    let eventualRole = planningRole;
    let eventualPlayer = existentPlayer;

    if (!existentPlayer || !isGoingToBePlayer) {
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
    }
  }

  /**
   * @method Room#toogleUserStatus
   * @public
   * @param {Player} player
   */
  togglePlayerStatus(player) {
    const {
      players,
      room,
      Game
    } = this;

    player.toggleStatus();
    this.update();

    if (players.every(isReady) && this.isRequiredPlayers()) {
      this.game = new Game({
        game: room,
        players
      });
    }
  }

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
      playersCount,
      status,
      players,
      observers
    } = this;

    return {
      id,
      name,
      playersCount,
      status,
      players,
      observers: observers.count
    };
  }
}

module.exports = Room;

function isReady(player) {
  return !player || player.isReady();
}
