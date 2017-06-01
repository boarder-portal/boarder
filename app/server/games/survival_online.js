const _ = require('lodash');
const { generateUID } = require('../helpers/generate-uid');
const Game = require('./');
const {
  games: {
    survival_online: {
      events: {
        game: {
          GET_INITIAL_INFO,
          MOVE_TO,
          REVERT_MOVE,
          CHANGED_CELLS
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
    [GET_INITIAL_INFO]: 'onPlayerRequestsInitialInfo',
    [MOVE_TO]: 'onMoveTo'
  };

  prepareGame() {
    super.prepareGame();

    this.createMap();
    this.placePlayers();

    this.startGame();
  }

  onPlayerRequestsInitialInfo(data, { player }) {
    const { map } = this;
    const { x: playerX, y: playerY } = player;

    player.emit(GET_INITIAL_INFO, {
      playerMap: {
        objects: map.objects
      },
      playerX,
      playerY
    });
  }

  onMoveTo({ toX, toY, fromX, fromY }, { player }) {

  };

  createMap() {
    const map = this.map = {
      objects: {}
    };

    _.times(Math.floor(mapH*mapW*0.00001), () => {
      const randX = Math.floor(Math.random()*mapW);
      const randY = Math.floor(Math.random()*mapH);

      const generatedID = generateUID();

      map.objects[generatedID] = {
        id: generatedID,
        x: randX,
        y: randY,
        type: 'tree'
      }
    });
  }

  placePlayers() {
    const {
      map: {
        objects
      }
    } = this;
    let startX = Math.floor(mapW/2);
    let startY = Math.floor(mapW/2);


    _.forEach(this.players, (player) => {
      const generatedID = generateUID();

      player.x = startX;
      player.y = startY;

      objects[generatedID] = {
        id: generatedID,
        x: startX,
        y: startY,
        type: 'player'
      };
    });
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

module.exports = SurvivalGame;
