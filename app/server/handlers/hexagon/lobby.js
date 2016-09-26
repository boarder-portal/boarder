const createRoom = require('../../sockets/hexagon/room');

module.exports = {
  onNewRoom() {
    const {
      server: io,
      nsp: lobby
    } = this;

    const room = createRoom(io);

    lobby.emit('room/new', room);
  },
  onDisconnect() {
    console.log('disconnected from hexagon lobby');
  }
};
