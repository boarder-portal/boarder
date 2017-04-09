import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import { gameWrapper } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';

const {
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
} = gamesConfig;

class SurvivalGame extends Block {
  static template = template();
  static listeners = {
    [GET_INITIAL_INFO]: 'onGetInitialInfo'
  };

  constructor(opts) {
    super(opts);

    const {
      emitter,
      socket
    } = this.args;
  }

  setup = () => {
    this.emit(GET_INITIAL_INFO);

    this.map = this.map || _.times(mapH, (y) => {
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
  };

  onGetInitialInfo({ playerMap, playerX, playerY }) {
    this.playerX = playerX;
    this.playerY = playerY;

    _.forEach(playerMap, (cell) => {
      this.map[cell.y][cell.x] = cell;
    });

    this.renderMap();
  }

  renderMap(cornerX, cornerY, direction, state) {
    const { playerX, playerY, map, ctx, cellSize } = this;

    cornerX = cornerX || playerX - Math.floor(pMapW/2);
    cornerY = cornerY || playerY - Math.floor(pMapH/2);

    _.times(pMapH, (y) => {
      _.times(pMapW, (x) => {
        const cell = map[cornerY + y] && map[cornerY + y][cornerX + x];

        if (cell) {
          if (cell.land === 'grass') {
            ctx.fillStyle = 'green';
          }

          if (cell.building === 'tree') {
            ctx.fillStyle = 'orange';
          }

          if (cell.creature === 'player') {
            ctx.fillStyle = 'black';
          }
        } else {
          ctx.fillStyle = 'black';
        }

        ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      });
    });
  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = Math.floor(Math.min(window.innerHeight/pMapH, window.innerWidth/pMapW));
    this.canvas.width = this.cellSize * pMapW;
    this.canvas.height = this.cellSize * pMapH;

    document.onkeydown = (e) => {
      console.log(e.keyCode);
    }
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
