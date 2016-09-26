const { store } = require('./');

store.hexagon = {
  rooms: {},
  ROOM_DESTRUCTION_DELAY: 10000,
  states: {
    BEFORE_PLAYING: 1,
    PLAYING: 2,
    RESULTS: 3
  }
};
