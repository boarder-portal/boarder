import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import { gameWrapper } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';

const {
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
    },
    timers: {
      BETWEEN_CELL_DRAWING_MOVING,
      DELAY_BETWEEN_PLAYER_ACTIONS,
      DELAY_IN_PARTS_OF_SELF_MOVING
    }
  }
} = gamesConfig;

class SurvivalGame extends Block {
  static template = template();
  static listeners = {
    [GET_INITIAL_INFO]: 'onGetInitialInfo',
  };

  constructor(opts) {
    super(opts);

    const {
      emitter,
      socket
    } = this.args;
    
    this.player = _.cloneDeep(this.globals.user);
  }

  setup = () => {
    this.emit(GET_INITIAL_INFO);

    this.map = this.map || {
      objects: {}
    };
  };

  onGetInitialInfo({ playerMap, playerX, playerY }) {
    this.player.x = playerX;
    this.player.y = playerY;

    _.forEach(playerMap.objects, (object) => {
      this.map.objects[object.id] = object;
    });

    this.renderMap();
  }

  renderMap() {
    const {
      player: {
        x: playerX,
        y: playerY
      },
      map: {
        objects
      },
      ctx
    } = this;

    const {
      x: cornerX,
      y: cornerY
    } = this.getCornerByCoords(playerX, playerY);

    ctx.fillStyle = '#3d8f27';
    ctx.fillRect(0, 0, pMapW, pMapH);

    console.log(objects);

    _.forEach(objects, (object) => {
      const {
        x: objectX,
        y: objectY
      } = object;

      console.log(objectX, objectY, objectX - cornerX, objectY - cornerY);

      switch(object.type) {
        case 'tree': {
          ctx.fillStyle = '#00770e';

          ctx.beginPath();
          ctx.arc(objectX - cornerX, objectY - cornerY, 25, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();

          break;
        }

        case 'player': {
          ctx.fillStyle = '#000';

          ctx.beginPath();
          ctx.arc(objectX - cornerX, objectY - cornerY, 25, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();

          break;
        }
      }
    });
  }

  onKeyDown(e) {
    const keyCodeActions = {
      65: 'left',
      68: 'right',
      87: 'top',
      83: 'bottom',
    };
    const keyCode = e.keyCode;
    const {
      playerX,
      playerY,
      map
    } = this;

    const action = keyCodeActions[keyCode];

    this.emit(MOVE_TO, { direction: action });
  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
    this.screenMinSize = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.width = pMapW;
    this.canvas.height = pMapH;
    this.canvas.style.width = `${pMapW*0.5}px`
    this.canvas.style.height = `${pMapH*0.5}px`

    document.onkeydown = this.onKeyDown.bind(this);
  }

  getCornerByCoords(centerX, centerY) {
    console.log(centerX, centerY, centerX - pMapW/2, centerY - pMapH/2);
    return {
      x: centerX - pMapW/2,
      y: centerY - pMapH/2
    };
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
