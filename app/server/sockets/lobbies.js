const { io } = require('../');
const Lobby = require('../game/Lobby');
const {
  games: gamesConfig
} = require('../../config/constants.json');

const games = [
  'pexeso',
  'hexagon',
  'virus_war',
  'dungeon_runner'
];

module.exports = () => {
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
