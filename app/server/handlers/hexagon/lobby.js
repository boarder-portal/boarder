const D = require('dwayne');
const HexagonRoom = require('../../rooms/hexagon');
const { now } = D;

module.exports = {
  onNewRoom() {
    const roomData = {
      playersCount: 3,
      name: `room-${ now() }`
    };

    new HexagonRoom(roomData);
  },
  onDisconnect() {
    console.log('disconnected from hexagon lobby');
  }
};
