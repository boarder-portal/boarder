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
        APPROVE_MOVE
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
    [APPROVE_MOVE]: 'onApproveMove'
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

    this.renderMap();
  }

  onRevertMove({ toX, toY, fromX, fromY }) {
    console.log('reverted: ', toX, toY, fromX, fromY);

    console.log(this.unapprovedMovements);

    _.forEachRight(this.unapprovedMovements, (unapprovedMovement) => {
      const {
        before,
      } = unapprovedMovement;

      _.forEachRight(before.cells, (cell) => {
        this.map[cell.y][cell.x] = _.cloneDeep(cell);
      });
    });

    this.unapprovedMovements = [];

    this.playerX = this.lastApprovedPlayerX;
    this.playerY = this.lastApprovedPlayerY;

    this.renderMap();
  }

  onApproveMove({ toX, toY, fromX, fromY }) {
    console.log('approved: ', toX, toY, fromX, fromY);

    _.forEach(this.unapprovedMovements, (unapprovedMovement, index) => {
      const {
        from: {
          x: fromUnapprovedMovementX,
          y: fromUnapprovedMovementY
        },
        to: {
          x: toUnapprovedMovementX,
          y: toUnapprovedMovementY
        },
        before,
        after
      } = unapprovedMovement;

      if (fromUnapprovedMovementX === fromX && fromUnapprovedMovementY === fromY
        && toUnapprovedMovementX === toX && toUnapprovedMovementY === toY) {
        this.unapprovedMovements.splice(index, 1);
        this.lastApprovedPlayerX = toX;
        this.lastApprovedPlayerY = toY;

        return false;
      }
    });
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
      const moveDifference = {
        from: { x: playerX, y: playerY },
        to: { x: null, y: null },
        before: { cells: [] },
        after: { cells: [] }
      };

      //console.log(keyCode);

      const action = keyCodeActions[keyCode];

      if (!action) return;

      let toX = playerX + (action === 'left' ? -1 : action === 'right' ? 1 : 0);
      let toY = playerY + (action === 'top' ? -1 : action === 'bottom' ? 1 : 0);
      const cellFrom = map[playerY][playerX];
      const cellTo = map[toY] && map[toY][toX];

      moveDifference.to = { x: toX, y: toY };
      moveDifference.before.cells.push(_.cloneDeep(cellFrom), _.cloneDeep(cellTo));

      this.emit(MOVE_TO, { toX, toY, fromX: playerX, fromY: playerY });

      if (cellTo) {
        this.playerX = toX;
        this.playerY = toY;

        cellFrom.creature = null;
        cellTo.creature = 'player';
      }

      moveDifference.after.cells.push(_.cloneDeep(cellFrom), _.cloneDeep(cellTo));

      this.unapprovedMovements.push(moveDifference);
      this.renderMap();
    }
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
