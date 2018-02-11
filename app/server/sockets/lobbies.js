const Lobby = require('../game/Lobby');
const {
  games: gamesConfig
} = require('../../config/constants.json');
const { gamesList } = require('../../shared/games');

module.exports = (io) => {
  gamesList.forEach((game) => {
    const {
      LOBBY_NSP,
      ROOM_NSP,
      playersCount
    } = gamesConfig[game];
    const Game = require(`../games/${game}`);

    new Lobby({
      io,
      socket: io.of(LOBBY_NSP),
      roomNsp: ROOM_NSP,
      rooms: {},
      playersCount,
      Game
    });
  });
};
