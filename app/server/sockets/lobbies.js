const _ = require('lodash');
const Lobby = require('../game/Lobby');
const {
  games: gamesConfig
} = require('../../config/constants.json');

const games = _.keys(_.omit(gamesConfig, 'global'));

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
      rooms: {},
      playersCount,
      Game
    });
  });
};
