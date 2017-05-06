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
    }
  }
} = gamesConfig;

class SurvivalGame extends Block {
  static template = template();
  static listeners = {
    [GET_INITIAL_INFO]: 'onGetInitialInfo',
    [REVERT_MOVE]: 'onRevertMove',
    [CHANGED_CELLS]: 'onChangedCells'
  };

  constructor(opts) {
    super(opts);

    const {
      emitter,
      socket
    } = this.args;
    
    this.player = this.globals.user;
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
    this.unapprovedMovements = [];
  };

  onGetInitialInfo({ playerMap, playerX, playerY }) {
    this.playerX = playerX;
    this.playerY = playerY;
    this.lastApprovedPlayerX = playerX;
    this.lastApprovedPlayerY = playerY;

    _.forEach(playerMap, (cell) => {
      this.map[cell.y][cell.x] = cell;
    });

    const playerCorner = this.getPlayerCornerByCellCoords(this.playerX, this.playerY);

    this.renderMap(playerCorner.x, playerCorner.y);
  }

  onRevertMove({ toX, toY, fromX, fromY }) {
    console.log('reverted: ', toX, toY, fromX, fromY);

    this.playerX = this.lastApprovedPlayerX;
    this.playerY = this.lastApprovedPlayerY;

    const playerCorner = this.getPlayerCornerByCellCoords(this.playerX, this.playerY);

    this.renderMap(playerCorner.x, playerCorner.y);
  }

  onChangedCells({ cells, additionalInfo }) {
    _.forEach(cells, (cell) => {
      this.map[cell.y][cell.x] = cell;
    });

    if (additionalInfo.approvedMove) {
      this.lastApprovedPlayerX = additionalInfo.approvedMove.toX;
      this.lastApprovedPlayerY = additionalInfo.approvedMove.toY;

      console.log('Approved: ', Date.now());
    }

    if (this.playerIsMoving) return;

    const playerCorner = this.getPlayerCornerByCellCoords(this.playerX, this.playerY);

    this.renderMap(playerCorner.x, playerCorner.y);
  }

  renderMap(cornerX, cornerY, stateX = 0, stateY = 0, direction) {
    //console.log(cornerX, cornerY, stateX, stateY, direction);
    const { playerX, playerY, map, ctx, cellSize } = this;

    cornerX = cornerX != null ? cornerX : playerX - Math.floor(pMapW/2);
    cornerY = cornerY != null ? cornerY : playerY - Math.floor(pMapH/2);

    _.times(pMapH + (direction === 'bottom' ? 1 : 0), (y) => {
      _.times(pMapW + (direction === 'right' ? 1 : 0), (x) => {
        const cell = map[cornerY + y] && map[cornerY + y][cornerX + x];

        if (cell) {
          if (cell.land === 'grass') {
            ctx.fillStyle = 'green';
          }

          if (cell.building === 'tree') {
            ctx.fillStyle = 'orange';
          }

          if (cell.creature) {
            if (cell.creature.type === 'player') {
              if (cell.creature.login === this.player.login) {
                //ctx.fillStyle = 'pink';
              } else {
                ctx.fillStyle = 'black';
              } 
            }
          }
        } else {
          ctx.fillStyle = 'black';
        }

        ctx.fillRect(Math.floor((-stateX +  x)*cellSize), Math.floor((-stateY + y)*cellSize), cellSize, cellSize);
      });
    });

    ctx.fillStyle = 'black';
    ctx.fillRect(this.canvas.width/2 - this.cellSize/2, this.canvas.height/2 - this.cellSize/2, this.cellSize, this.cellSize);

    if (this.playerIsMoving && direction) {
      if ((direction === 'right' && stateX === 1)
        || (direction === 'left' && stateX === 0)
        || (direction === 'top' && stateY === 0)
        || (direction === 'bottom' && stateY === 1)) {
        this.playerIsMoving = false;

        return;
      }

      let newStateX = stateX;
      let newStateY = stateY;

      if (direction === 'right') {
        newStateX = Math.min(newStateX + 0.2, 1);
      } else if (direction === 'left') {
        newStateX = Math.max(newStateX - 0.2, 0);
      } else if (direction === 'top') {
        newStateY = Math.max(newStateY - 0.2, 0);
      } else if (direction === 'bottom') {
        newStateY = Math.min(newStateY + 0.2, 1);
      }

      newStateX = Number(newStateX.toFixed(1));
      newStateY = Number(newStateY.toFixed(1));

      //setTimeout(() => this.renderMap.call(this, cornerX, cornerY, newStateX, newStateY, direction), 500);

      requestAnimationFrame(this.renderMap.bind(this, cornerX, cornerY, newStateX, newStateY, direction));
    }
  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = Math.floor(Math.min(window.innerHeight/pMapH, window.innerWidth/pMapW));
    this.canvas.width = this.cellSize * pMapW;
    this.canvas.height = this.cellSize * pMapH;

    const keyCodeActions = {
      65: 'left',
      68: 'right',
      87: 'top',
      83: 'bottom',
    };

    document.onkeydown = (e) => {
      const keyCode = e.keyCode;
      const {
        playerX,
        playerY,
        map
      } = this;

      //console.log(keyCode);

      const action = keyCodeActions[keyCode];

      if (!action || this.playerIsMoving) return;

      let toX = playerX + (action === 'left' ? -1 : action === 'right' ? 1 : 0);
      let toY = playerY + (action === 'top' ? -1 : action === 'bottom' ? 1 : 0);
      const cellFrom = map[playerY][playerX];
      const cellTo = map[toY] && map[toY][toX];

      if (cellTo && (cellTo.creature || cellTo.building)) return;

      this.emit(MOVE_TO, { toX, toY, fromX: playerX, fromY: playerY });

      let newCornerX;
      let newCornerY;
      let newStateX = 0;
      let newStateY = 0;
      const oldCorner = this.getPlayerCornerByCellCoords(playerX, playerY);
      const newCorner = this.getPlayerCornerByCellCoords(toX, toY);

      if (cellTo) {
        if (action === 'right') {
          newCornerX = oldCorner.x;
          newCornerY = oldCorner.y;
          newStateX = 0.2;
        } else if (action === 'left') {
          newCornerX = newCorner.x;
          newCornerY = newCorner.y;
          newStateX = 0.8;
        } else if (action === 'top') {
          newCornerX = newCorner.x;
          newCornerY = newCorner.y;
          newStateY = 0.8;
        } else if (action === 'bottom') {
          newCornerX = oldCorner.x;
          newCornerY = oldCorner.y;
          newStateY = 0.2;
        }

        this.playerX = toX;
        this.playerY = toY;
        this.playerIsMoving = true;
      }

      console.log('Start moving: ', Date.now());

      this.renderMap(newCornerX, newCornerY, newStateX, newStateY, action);
    }
  }

  getPlayerCornerByCellCoords(cellX, cellY) {
    return {
      x: cellX - Math.floor(pMapW/2),
      y: cellY - Math.floor(pMapH/2)
    }
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
