const D = require('dwayne');
const { io } = require('../');
const { socketAuth } = require('../controllers/auth');
const {
  games: {
    global: {
      events: {
        lobby: {
          LIST_GET,
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
   * @member {Room[]} Lobby#rooms
   * @public
   */

  constructor() {
    const { lobby } = this;

    lobby.use(socketAuth);
    lobby.on('connection', this.userEnter.bind(this));
  }

  /**
   * @method Lobby#createRoom
   * @public
   */
  createRoom() {
    const {
      Room,
      lobby,
      _rooms
    } = this;
    const room = new Room();

    _rooms[room.id] = room;

    lobby.emit(NEW_ROOM, room);
  }

  /**
   * @method Lobby#updateRoom
   * @public
   * @param {Room} room
   */
  updateRoom(room) {
    const { lobby } = this;

    lobby.emit(UPDATE_ROOM, room);
  }

  /**
   * @method Lobby#deleteRoom
   * @public
   * @param {Room} room
   */
  deleteRoom(room) {
    const {
      lobby,
      _rooms
    } = this;

    delete _rooms[id];
    delete io.nsps[nsp];

    lobby.emit(DELETE_ROOM, room);
  }

  /**
   * @method Lobby#userEnter
   * @public
   * @param {Socket} socket
   */
  userEnter(socket) {
    console.log(`connected to ${ this.name } lobby`);

    socket.emit(LIST_GET, this.rooms);

    socket.on(NEW_ROOM, this.createRoom.bind(this));
    socket.on('disconnect', () => this.userLeave(socket));
  }

  /**
   * @method Lobby#userLeave
   * @public
   * @param {Socket} socket
   */
  userLeave() {
    console.log(`disconnected from ${ this.name } lobby`);
  }
}

D(Lobby.prototype).assign({
  name: 'default'
});

module.exports = Lobby;
