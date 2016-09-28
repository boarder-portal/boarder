const {
  constants,
  store
} = require('./');

store.hexagon = {
  rooms: []
};

constants.hexagon = {
  states: {
    BEFORE_PLAYING: 1,
    PLAYING: 2,
    RESULTS: 3
  }
};
