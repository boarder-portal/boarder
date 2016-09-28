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
const isReady = method('isReady');

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
   * @member {Object} Room#players
   * @public
   */
  /**
   * @member {Object[]} Room#observers
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
      players: array(playersCount, () => null).$,
      observers: [],
      room,
      _timeout: timeout
    }, props, {
      _expires
    });

    this.expires(_expires);

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
   * @param {Number} time
   */
  expires(time) {
    this._timeout.abort();

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
    const eventualRole = role === 'observer' || game ? OBSERVER : PLAYER;
    const isPlayer = eventualRole === PLAYER;

    socket.role = eventualRole;

    let player = players.find((player) => player && player.login === user.login);

    if (!player) {
      const { key } = D(players).find(isNull) || {};
      const willBePlayer = !isNull(key) && isPlayer;

      player = new Player({
        login: user.login,
        room: this
      });

      if (willBePlayer) {
        players[key] = player;
      } else {
        observers.push(player);
      }

      this.update(socket);
    }

    player.sockets.push(socket.id);

    socket.player = player;
    socket.emit(ENTER_ROOM, {
      role: eventualRole,
      room: this
    });

    if (isPlayer) {
      socket.on(TOGGLE_PLAYER_STATUS, () => this.toggleUserStatus(player));
    }
  }

  /**
   * @method Room#toogleUserStatus
   * @public
   * @param {Player} player
   */
  toggleUserStatus(player) {
    const {
      players,
      room,
      Game
    } = this;

    player.toggleStatus();

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
      room: {
        status,
        players,
        observers
      },
      player
    } = socket;

    const playerIndex = players.indexOf(player);
    const observerIndex = observers.indexOf(player);

    if (playerIndex !== -1 && status === NOT_PLAYING) {
      const { sockets } = player;
      const existentSocketIndex = sockets.indexOf(socket.id);

      if (existentSocketIndex !== -1) {
        sockets.splice(existentSocketIndex, 1);
      }

      if (!sockets.length) {
        players[playerIndex] = null;

        this.update();
      }
    } else if (observerIndex !== -1) {
      observers.splice(observerIndex, 1);

      this.update();
    }

    if (players.every(isNull) && !observers.length) {
      this.expires(this._expires);
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
      observers: observers.length
    };
  }
}

module.exports = Room;
