const _ = require('lodash');
const Game = require('./');
const {
  games: {
    survival_online: {
      events: {
        game: {
          GET_INITIAL_INFO
        }
      },
      map: {
        width: mapW,
        height: mapH
      },
      playerMap: {
        width: pMapW,
        height: pMapH
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
    [GET_INITIAL_INFO]: 'onGetInitialInfo'
  };

  prepareGame() {
    super.prepareGame();

    this.createMap();
    this.placePlayers();

    this.startGame();
  }

  onGetInitialInfo(data, { player }) {
    const { map } = this;
    const { x: playerX, y: playerY } = player;
    const cornerX = playerX - Math.floor(pMapW/2);
    const cornerY = playerY - Math.floor(pMapH/2);

    const playerMap = [];

    _.times(pMapH, (y) => {
      _.times(pMapW, (x) => {
        const cell = map[cornerY + y] && map[cornerY + y][cornerX + x];

        if (cell) {
          playerMap.push(cell);
        }
      });
    });

    player.emit(GET_INITIAL_INFO, {
      playerMap,
      playerX,
      playerY
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

    _.times(Math.floor(mapH*mapW*0.1), () => {
      const randX = Math.floor(Math.random()*mapW);
      const randY = Math.floor(Math.random()*mapH);

      const cell = this.map[randY][randX];

      if (cell.land === 'grass' && !cell.creature && !cell.building) {
        cell.building = 'tree';
      }
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
      }
    });
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

module.exports = SurvivalGame;
