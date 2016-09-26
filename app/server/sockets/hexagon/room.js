const D = require('dwayne');
const { socketAuth } = require('../../controllers/auth');
const {
  onDisconnect
} = require('../../handlers/hexagon/room');
const {
  store: {
    hexagon: {
      rooms,
      ROOM_DESTRUCTION_DELAY,
      states: { BEFORE_PLAYING }
    }
  }
} = require('../../constants');
const {
  io: {
    hexagonLobbyNsp,
    hexagonRoomNsp
  },
  games: {
    hexagon: {
      roomStatuses: { NOT_PLAYING },
      playerStatuses: {
        PLAYER,
        OBSERVER
      }
    }
  }
} = require('../../../config/constants.json');

const {
  now,
  method,
  array,
  isNull
} = D;
const disconnect = method('disconnect');

module.exports = (io) => {
  const roomId = now();
  const lobby = io.of(hexagonLobbyNsp);
  const room = io.of(hexagonRoomNsp.replace(/\$roomId/, roomId));
  const name = `room-${ roomId }`;
  const playersCount = 3;
  const players = array(playersCount, () => null);
  const observers = [];
  const deleteRoom = () => onDeleteRoom(io, roomId);
  const timeout = {
    timeout: D(ROOM_DESTRUCTION_DELAY)
      .timeout(),
    deleteRoom
  };
  const roomData = {
    id: roomId,
    name,
    status: NOT_PLAYING,
    playersCount,
    players,
    timeout,
    observers
  };

  rooms[roomId] = roomData;

  timeout.timeout.then(deleteRoom, () => {});

  room.lobby = lobby;
  room.roomData = roomData;

  room.use(socketAuth);
  room.on('connection', (socket) => {
    console.log('connected to hexagon room');

    const {
      session,
      session: { user }
    } = socket;
    const { key } = D(players).find(isNull) || {};

    timeout.timeout.abort();

    user.status = BEFORE_PLAYING;

    if (isNull(key)) {
      user.status = OBSERVER;
      observers.push(session);
    } else {
      user.status = PLAYER;
      user.playerId = key;
      players[key] = session;
    }

    session.save();

    lobby.emit('room/update', roomData);
    room.emit('room/update', roomData);
    socket.emit('room/enter', roomData);

    socket.on('disconnect', onDisconnect);
  });

  return roomData;
};

function onDeleteRoom(io, roomId) {
  const lobby = io.of(hexagonLobbyNsp);
  const nsp = hexagonRoomNsp.replace(/\$roomId/, roomId);
  const room = io.of(nsp);
  const { connected } = room;
  const sockets = D(connected);

  room.removeAllListeners();

  while (connected.length) {
    sockets.forEach(disconnect);
  }

  delete rooms[roomId];
  delete io.nsps[nsp];

  lobby.emit('room/delete', roomId);

  console.log('deleting room');
}
