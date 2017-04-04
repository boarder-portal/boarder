const _ = require('lodash');
const Game = require('./');
const {
  games: {
    survival_online: {
      events: {
        game: {
          HELLO,
          GET_INITIAL_INFO
        }
      },
      map: {
        width: mapW,
        height: mapH
      }
    }
  }
} = require('../../config/constants.json');

/**
 * @class SurvivalGame
 * @extends Game
 * @public
 */
class SurvivalGame extends Game {
  static listeners = {
    [HELLO]: 'onHello'
  };

  prepareGame() {
    super.prepareGame();

    this.createMap();
    this.placePlayers();
    this.sendInitialInfo();

    this.startGame();

    setTimeout(() => {
      this.emit(HELLO, 'Hello, Player!');
    }, 2000);
  }

  sendInitialInfo(player) {
    const sendInitialInfoToPlayer = (player) => {
      this.emit(GET_INITIAL_INFO, {
        map: this.map
      });
    };

    if (player) {
      return sendInitialInfoToPlayer(player);
    }

    _.forEach(this.players, (player) => {
      //observers?

      sendInitialInfoToPlayer(player);
    });
  }

  createMap() {
    this.map = _.times(mapH, (y) => {
      return _.times(mapW, (x) => {
        return {
          x,
          y,
          land: 'grass',
          building: null,
          creature: null
        }
      });
    });
  }

  placePlayers() {
    const map = this.map;
    let startX = Math.floor(mapW/2);
    let startY = Math.floor(mapW/2);

    _.forEach(this.players, (player) => {
      let isPlayerPlaced = false;

      while (!isPlayerPlaced) {
        if (map[startY] && map[startY][startX]) {
          const cell = map[startY][startX];

          if (!cell.creature && !cell.building) {
            cell.creature = 'player';

            player.x = startX;
            player.y = startY;

            isPlayerPlaced = true;
          }
        }

        startX++;
        startY++;
      }
    });
  }

  onHello(data, socket) {
    console.log(data, socket.id);
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

module.exports = SurvivalGame;
