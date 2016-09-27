/* eslint eqeqeq: 0 */
const D = require('dwayne');
const { socketAuth } = require('../controllers/auth');
const { io } = require('../index');
const {
  games: {
    global: {
      roomStatuses: {
        NOT_PLAYING,
        PLAYING
      },
      playerStatuses: {
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
  alphabet: Alphabet,
  array,
  isNull,
  method,
  now
} = D;
const disconnect = method('disconnect');
const alphabet = Alphabet('a-z');

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
   * @member {Promise} Room#_timeout
   * @protected
   */
  /**
   * @member {String} Room#_roomNsp
   * @protected
   */

  constructor(props) {
    const { _roomNsp } = this;
    const { expires = ROOM_DESTRUCTION_DELAY } = props;
    const roomId = `${ alphabet.token(7) }-${ now() }`;
    const room = io.of(_roomNsp.replace(/\$roomId/, roomId));

    D(this)
      .assign({
        id: roomId,
        name: 'default',
        status: NOT_PLAYING,
        players: array(props.playersCount, () => null),
        observers: [],
        room,
        _timeout: D(0).timeout()
      }, props);

    this.expires(expires);

    room.use(socketAuth);
    room.on('connection', this.userEnter.bind(this));
  }

  /**
   * @method Room#expires
   * @public
   * @param {Number} time
   */
  expires(time) {
    this._timeout.abort();

    time = time === Infinity ? Math.pow(10, 20) : time;

    this._timeout = D(time)
      .timeout()
      .then(() => this.delete())
      .catch(() => {});
  }

  /**
   * @method Room#userEnter
   * @param {Socket} socket
   */
  userEnter(socket) {
    console.log(`connected to ${ this.name } room`);

    this.expires(Infinity);

    const {
      request: {
        query: { role }
      },
      session: { user }
    } = socket;

    socket.role = role == OBSERVER ? role : PLAYER;

    const {
      players,
      observers,
      lobby,
      room
    } = this;

    const existentPlayer = D(players).find((player) => player.login === user.login);

    if (existentPlayer) {
      socket.player = existentPlayer;

      return;
    }

    const player = {
      login: user.login
    };
    const { key } = D(players).find(isNull) || {};

    if (isNull(key)) {
      player.status = OBSERVER;
      observers.push(player);
    } else {
      player.status = PLAYER;
      player.playerId = key;
      players[key] = player;
    }

    socket.player = player;

    lobby.updateRoom(this);

    room.emit('player/enter', this);
    socket.emit('room/enter', this);

    socket.on('disconnect', () => this.userLeave(socket));
  }

  /**
   * @method Room#userLeave
   * @public
   * @param {Socket} socket
   */
  userLeave(socket) {

  }

  delete() {
    const {
      id,
      lobby,
      room
    } = this;

    const { connected } = room;
    const sockets = D(connected);

    room.removeAllListeners();

    while (connected.length) {
      sockets.forEach(disconnect);
    }

    console.log(room);

    lobby.deleteRoom(id);

    console.log('deleting room');
  }
}

module.exports = Room;
