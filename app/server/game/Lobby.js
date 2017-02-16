const _ = require('lodash');
const { io } = require('../');
const Room = require('./Room');
const {
  socketSession,
  socketAuth
} = require('../controllers/auth');
const {
  generateUID
} = require('../helpers');
const {
  games: {
    global: {
      events: {
        lobby: {
          GET_LIST,
          NEW_ROOM,
          UPDATE_ROOM,
          DELETE_ROOM
        }
      }
    }
  }
} = require('../../config/constants.json');

/**
 * @class Lobby
 * @public
 */
class Lobby {
  /**
   * @member {String} Lobby#name
   * @public
   */
  /**
   * @member {Namespace} Lobby#lobby
   * @public
   */
  /**
   * @member {Function} Lobby#Room
   * @public
   */
  /**
   * @member {Object.<String, Room>} Lobby#rooms
   * @public
   */

  constructor(options) {
    _.assign(this, options);

    const { socket } = this;

    socket.use(socketSession);
    socket.use(socketAuth);
    socket.on('connection', this.userEnter);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  /**
   * @method Lobby#createRoom
   * @public
   * @param {*} options
   */
  createRoom = (options) => {
    const {
      rooms,
      roomNsp,
      playersCount,
      Game
    } = this;
    const now = Date.now();
    const roomId = `${ now }-${ generateUID(7, rooms) }`;

    const roomData = {
      id: roomId,
      lobby: this,
      playersCount,
      name: `room-${ now }`,
      roomNsp,
      Game,
      gameOptions: options
    };
    const room = new Room(roomData);

    rooms[roomId] = room;

    this.emit(NEW_ROOM, room);

    console.log(`creating room #${ room.id }`);
  };

  /**
   * @method Lobby#deleteRoom
   * @public
   * @param {Room} room
   */
  deleteRoom(room) {
    const { rooms } = this;
    const {
      id,
      socket: { name }
    } = room;

    delete rooms[id];
    delete io.nsps[name];

    this.emit(DELETE_ROOM, id);
    console.log(`deleting room #${ room.id }`);
  }

  /**
   * @method Lobby#updateRoom
   * @public
   * @param {Room} room
   */
  updateRoom(room) {
    this.emit(UPDATE_ROOM, room);
  }

  /**
   * @method Lobby#userEnter
   * @public
   * @param {Socket} socket
   */
  userEnter = (socket) => {
    console.log('connected to lobby');

    socket.emit(GET_LIST, this.rooms);

    socket.on(NEW_ROOM, this.createRoom);
    socket.on('disconnect', () => this.userLeave(socket));
  };

  /**
   * @method Lobby#userLeave
   * @public
   * @param {Socket} socket
   */
  userLeave() {
    console.log('disconnected from lobby');
  }
}

_.assign(Lobby.prototype, {
  name: 'default'
});

module.exports = Lobby;
