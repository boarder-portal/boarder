const D = require('dwayne');
const Lobby = require('../game/Lobby');
const {
  games: gamesConfig
} = require('../../config/constants.json');

const { self } = D;
const games = D(gamesConfig)
  .map(self)
  .delete('global')
  .keys();

module.exports = (io) => {
  games.forEach((game) => {
    const {
      LOBBY_NSP,
      ROOM_NSP,
      playersCount
    } = gamesConfig[game];
    const Game = require(`../games/${ game }`);

    new Lobby({
      socket: io.of(LOBBY_NSP),
      roomNsp: ROOM_NSP,
      rooms: [],
      playersCount,
      Game
    });
  });
};
