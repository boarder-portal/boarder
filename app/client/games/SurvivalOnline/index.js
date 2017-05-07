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
  };

  onGetInitialInfo({ playerMap, playerX, playerY }) {
    this.playerX = playerX;
    this.playerY = playerY;
    this.lastApprovedPlayerX = playerX;
    this.lastApprovedPlayerY = playerY;
    this.lastPlayerMoveTimestamp = Date.now();

    _.forEach(playerMap, (cell) => {
      this.map[cell.y][cell.x] = cell;
    });

    this.renderMap();
  }

  onRevertMove({ toX, toY, fromX, fromY }) {
    console.log('Reverted: ', toX, toY, fromX, fromY);

    this.playerX = this.lastApprovedPlayerX;
    this.playerY = this.lastApprovedPlayerY;

    this.renderMap();
  }

  onChangedCells({ cells, additionalInfo }) {
    //console.log('Changed cells: ', cells);

    _.forEach(cells, (cell) => {
      if (cell.move) {
        if (cell.creature.login === this.player.login) {
          delete cell.move;
        } else {
          cell.move.startMoving = Date.now();
        }
      }

      this.map[cell.y][cell.x] = cell;
    });

    if (additionalInfo.approvedMove) {
      this.lastApprovedPlayerX = additionalInfo.approvedMove.toX;
      this.lastApprovedPlayerY = additionalInfo.approvedMove.toY;

      //console.log('Approved: ', Date.now());
    }

    if (this.playerIsMoving) return;

    this.renderMap();
  }

  renderMap(cornerX, cornerY, stateX = 0, stateY = 0, direction) {
    //console.log(...arguments, Date.now());
    const { playerX, playerY, map, ctx, cellSize } = this;
    const movingObjects = [];

    cornerX = cornerX != null ? cornerX : playerX - Math.floor(pMapW/2);
    cornerY = cornerY != null ? cornerY : playerY - Math.floor(pMapH/2);

    _.times(pMapH + (direction === 'bottom' ? 1 : 0), (y) => {
      _.times(pMapW + (direction === 'right' ? 1 : 0), (x) => {
        const cell = map[cornerY + y] && map[cornerY + y][cornerX + x];

        if (cell) {
          const {
            land: cellLand,
            building: cellBuilding,
            creature: cellCreature
          } = cell;

          if (cellLand) {
            if (cellLand === 'grass') {
              ctx.fillStyle = 'green';
            }

            ctx.fillRect(Math.floor((-stateX +  x)*cellSize), Math.floor((-stateY + y)*cellSize), cellSize, cellSize);
          }

          if (cellBuilding) {
            if (cellBuilding === 'tree') {
              ctx.fillStyle = 'orange';
            }

            ctx.fillRect(Math.floor((-stateX +  x)*cellSize), Math.floor((-stateY + y)*cellSize), cellSize, cellSize);
          }

          if (cellCreature) {
            if (cell.creature.type === 'player' && cell.creature.login !== this.player.login) {
              ctx.fillStyle = 'black';
            }

            if (!cell.move) {
              ctx.fillRect(Math.floor((-stateX +  x)*cellSize), Math.floor((-stateY + y)*cellSize), cellSize, cellSize);
            } else {
              movingObjects.push({ ...cell, originalCell: cell, relativeX: x, relativeY: y });
            }
          }
        } else {
          ctx.fillStyle = 'black';

          ctx.fillRect(Math.floor((-stateX +  x)*cellSize), Math.floor((-stateY + y)*cellSize), cellSize, cellSize);
        }
      });
    });

    _.forEach(movingObjects, (cell) => {
      const cellDirection = cell.move.direction;
      const cellMovingState = Math.min((Date.now() - cell.move.startMoving)/BETWEEN_CELL_DRAWING_MOVING, 1);
      const shiftX = cellDirection === 'right' ? -1 + cellMovingState : cellDirection === 'left' ? 1 - cellMovingState : 0;
      const shiftY = cellDirection === 'top' ? 1 - cellMovingState : cellDirection === 'bottom' ? -1 + cellMovingState : 0;

      if (cellMovingState >= 1) {
        delete cell.originalCell.move;
      }

      ctx.fillStyle = 'black';
      ctx.fillRect(Math.floor((-stateX + shiftX +  cell.relativeX)*cellSize), Math.floor((-stateY + shiftY + cell.relativeY)*cellSize), cellSize, cellSize);
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

      let newStateX = direction === 'right'
        ? Math.min(stateX + DELAY_IN_PARTS_OF_SELF_MOVING, 1)
        : direction === 'left'
          ? Math.max(stateX - DELAY_IN_PARTS_OF_SELF_MOVING, 0)
          : stateX;
      let newStateY = direction === 'top'
        ? Math.max(stateY - DELAY_IN_PARTS_OF_SELF_MOVING, 0)
        : direction === 'bottom'
          ? Math.min(stateY + DELAY_IN_PARTS_OF_SELF_MOVING, 1)
          : stateY;

      newStateX = Number(newStateX.toFixed(1));
      newStateY = Number(newStateY.toFixed(1));

      requestAnimationFrame(() => this.renderMap(cornerX, cornerY, newStateX, newStateY, direction));
    } else if (movingObjects.length) {
      requestAnimationFrame(() => this.renderMap());
    }
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

    //console.log(keyCode);

    const action = keyCodeActions[keyCode];

    if (!action || this.playerIsMoving || Date.now() - this.lastPlayerMoveTimestamp < DELAY_BETWEEN_PLAYER_ACTIONS) return;

    this.lastPlayerMoveTimestamp = Date.now();

    let toX = playerX + (action === 'left' ? -1 : action === 'right' ? 1 : 0);
    let toY = playerY + (action === 'top' ? -1 : action === 'bottom' ? 1 : 0);
    const cellFrom = map[playerY][playerX];
    const cellTo = map[toY] && map[toY][toX];

    if (!cellTo || cellTo && (cellTo.creature || cellTo.building)) return;

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
        newStateX = DELAY_IN_PARTS_OF_SELF_MOVING;
      } else if (action === 'left') {
        newCornerX = newCorner.x;
        newCornerY = newCorner.y;
        newStateX = 1 - DELAY_IN_PARTS_OF_SELF_MOVING;
      } else if (action === 'top') {
        newCornerX = newCorner.x;
        newCornerY = newCorner.y;
        newStateY = 1 - DELAY_IN_PARTS_OF_SELF_MOVING;
      } else if (action === 'bottom') {
        newCornerX = oldCorner.x;
        newCornerY = oldCorner.y;
        newStateY = DELAY_IN_PARTS_OF_SELF_MOVING;
      }

      this.playerX = toX;
      this.playerY = toY;
      this.playerIsMoving = true;
    }

    //console.log('Start moving: ', Date.now());

    this.renderMap(newCornerX, newCornerY, newStateX, newStateY, action);
  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
    this.cellSize = Math.floor(Math.min(window.innerHeight/pMapH, window.innerWidth/pMapW));
    this.canvas.width = this.cellSize * pMapW;
    this.canvas.height = this.cellSize * pMapH;

    document.onkeydown = this.onKeyDown.bind(this);
  }

  getPlayerCornerByCellCoords(cellX, cellY) {
    return {
      x: cellX - Math.floor(pMapW/2),
      y: cellY - Math.floor(pMapH/2)
    }
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
