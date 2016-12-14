const { io } = require('../');
const Lobby = require('../game/Lobby');
const { games: gamesConfig } = require('../../config/constants.json');

const games = {
  pexeso: 'pexeso',
  hexagon: 'hexagon',
  virusWar: 'virus-war'
};

module.exports = () => {
  games.forEach((filename, game) => {
    const {
      LOBBY_NSP,
      ROOM_NSP,
      playersCount
    } = gamesConfig[game];
    const Game = require(`../games/${ filename }`);

    new Lobby({
      socket: io.of(LOBBY_NSP),
      roomNsp: ROOM_NSP,
      rooms: [],
      playersCount,
      Game
    });
  });
};
