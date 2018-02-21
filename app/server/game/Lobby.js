import _ from 'lodash';

import Room from './Room';
import {
  socketSession,
  socketAuth
} from '../controllers/auth';
import { generateUID } from '../helpers';
import { games } from '../../shared/constants';

const {
  GET_LIST,
  NEW_ROOM,
  UPDATE_ROOM,
  DELETE_ROOM
} = games.global.events.lobby;

/**
 * @class Lobby
 * @public
 */
class Lobby {
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

  emit(...args) {
    this.socket.emit(...args);
  }

  /**
   * @method Lobby#createRoom
   * @public
   * @param {*} options
   */
  createRoom = (options) => {
    const {
      io,
      rooms,
      gameName,
      playersCount,
      Game
    } = this;
    const now = Date.now();
    const roomId = `${now}-${generateUID(7, rooms)}`;

    const roomData = {
      io,
      id: roomId,
      lobby: this,
      playersCount,
      name: `room-${now}`,
      gameName,
      Game,
      gameOptions: options
    };
    const room = new Room(roomData);

    rooms[roomId] = room;

    this.emit(NEW_ROOM, room);

    console.log(`creating room #${room.id}`);
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
    delete this.io.nsps[name];

    this.emit(DELETE_ROOM, id);
    console.log(`deleting room #${room.id}`);
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
    console.log(`connected to lobby ${socket.id.slice(socket.id.indexOf('#'))}`);

    socket.emit(GET_LIST, this.rooms);

    socket.on(NEW_ROOM, this.createRoom);
    socket.on('disconnect', () => this.userLeave(socket));
  };

  /**
   * @method Lobby#userLeave
   * @public
   * @param {Socket} socket
   */
  userLeave(socket) {
    console.log(`disconnected from lobby ${socket.id.slice(socket.id.indexOf('#'))}`);
  }
}

export default Lobby;
