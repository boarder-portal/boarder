const { io } = require('../');
const Lobby = require('../game/Lobby');
const { games: gamesConfig } = require('../../config/constants.json');

const games = {
  pexeso: {
    rooms: {}
  },
  hexagon: {
    rooms: {}
  },
  virusWar: {
    rooms: {},
    filename: 'virus-war'
  }
};

module.exports = () => {
  games.forEach(({ rooms, filename }, game) => {
    const {
      LOBBY_NSP,
      ROOM_NSP
    } = gamesConfig[game];
    const Game = require(`../games/${ filename || game }`);

    new Lobby({
      socket: io.of(LOBBY_NSP),
      roomNsp: ROOM_NSP,
      rooms,
      Game
    });
  });
};
