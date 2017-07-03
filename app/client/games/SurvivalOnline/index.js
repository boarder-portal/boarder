import _ from 'lodash';
import { Block, doc } from 'dwayne';
import Promise from 'el-promise';
import template from './index.pug';
import { gameWrapper } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';
import { deepMap } from '../../../shared/survival-online';

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
    },
    imagesPaths
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
    
    this.player = {
      ...this.globals.user
    };
    this.imagesLoaded = false;

    const imagesPathsAsArray = [];

    deepMap(imagesPaths, (href) => {
      imagesPathsAsArray.push(href);
    });

    this.loadImagesPromise = Promise.all(
      _.map(imagesPathsAsArray, (href) => (
        new Promise((resolve) => {
          const image = new Image();

          image.addEventListener('load', () => resolve(image));
          image.src = `/public/images/survival_online/${ href }`;
        })
      ))
    ).then((images) => {
      this.images = _.cloneDeep(imagesPaths);
      this.imagesLoaded = true;

      let index = 0;

      deepMap(this.images, (href, name, obj) => {
        obj[name] = images[index++];
      });
    });
  }

  setup() {
    this.emit(GET_INITIAL_INFO);

    this.map = this.map || _.times(mapH, (y) => {
      return _.times(mapW, (x) => {
        return {
          x,
          y,
          land: 'grass',
          building: null,
          creature: null
        };
      });
    });
  }

  onGetInitialInfo({ playerMap, playerX, playerY }) {
    console.log('Initial info: ', ...arguments);

    const {
      player,
      map
    } = this;

    player.x = playerX;
    player.y = playerY;
    player.lastApprovedPlayerX = playerX;
    player.lastApprovedPlayerY = playerY;
    player.lastMoveTimestamp = Date.now();

    _.forEach(playerMap, (cell) => {
      map[cell.y][cell.x] = cell;
    });

    this.renderMap();
  }

  onRevertMove({ toX, toY, fromX, fromY }) {
    console.log('Reverted: ', toX, toY, fromX, fromY);

    const player = this.player;

    player.x = player.lastApprovedPlayerX;
    player.y = player.lastApprovedPlayerY;

    this.renderMap();
  }

  onChangedCells({ cells, additionalInfo }) {
    //console.log('Changed cells: ', cells);
    const {
      player,
      map
    } = this;

    _.forEach(cells, (cell) => {
      if (cell.move) {
        if (cell.creature.login === this.player.login) {
          delete cell.move;
        } else {
          cell.move.startMoving = Date.now();
        }
      }

      map[cell.y][cell.x] = cell;
    });

    if (additionalInfo.approvedMove) {
      player.lastApprovedPlayerX = additionalInfo.approvedMove.toX;
      player.lastApprovedPlayerY = additionalInfo.approvedMove.toY;

      //console.log('Approved: ', Date.now());
    }

    if (player.isMoving) return;

    this.renderMap();
  }

  renderMap(cornerX, cornerY, stateX = 0, stateY = 0, direction) {
    if (!this.imagesLoaded) {
      return this.loadImagesPromise.then(() => this.renderMap(...arguments));
    }
    //console.log(...arguments, Date.now());

    const {
      player,
      player: {
        x: playerX,
        y: playerY,
        login
      },
      map
    } = this;
    const movingObjects = [];
    let selfCell;

    cornerX = cornerX != null ? cornerX : this.getCornerByMiddleCell({ x: playerX, y: playerY  }).x;
    cornerY = cornerY != null ? cornerY : this.getCornerByMiddleCell({ x: playerX, y: playerY  }).y;

    _.times(pMapH + (direction === 'bottom' ? 1 : 0), (y) => {
      _.times(pMapW + (direction === 'right' ? 1 : 0), (x) => {
        const cell = map[cornerY + y] && map[cornerY + y][cornerX + x];

        this.renderCell({
          cell,
          x: -stateX + x,
          y:  -stateY + y,
          renderSelf: false,
          renderMoving: false
        });

        if (cell && cell.creature && cell.move) {
          movingObjects.push({ ...cell, originalCell: cell, relativeX: x, relativeY: y });
        }

        if (cell && cell.creature && cell.creature.type === 'player' && cell.creature.login === login) {
          selfCell = cell;
        }
      });
    });

    _.forEach(movingObjects, (cell) => {
      const cellDirection = cell.move.direction;
      const cellMovingState = Math.min((Date.now() - cell.move.startMoving) / BETWEEN_CELL_DRAWING_MOVING, 1);
      const shiftX = cellDirection === 'right' ? -1 + cellMovingState : cellDirection === 'left' ? 1 - cellMovingState : 0;
      const shiftY = cellDirection === 'top' ? 1 - cellMovingState : cellDirection === 'bottom' ? -1 + cellMovingState : 0;

      if (cellMovingState >= 1) {
        delete cell.originalCell.move;
      }

      this.renderCell({
        cell,
        x: -stateX + shiftX + cell.relativeX,
        y: -stateY + shiftY + cell.relativeY,
        renderSelf: false,
        renderMoving: true
      });
    });

    this.renderCell({
      cell: selfCell,
      x: Math.round((pMapW - 1) / 2),
      y: Math.round((pMapH - 1) / 2),
      renderSelf: true,
      renderMoving: true
    });

    if (player.isMoving && direction) {
      if (
        (direction === 'right' && stateX === 1)
        || (direction === 'left' && stateX === 0)
        || (direction === 'top' && stateY === 0)
        || (direction === 'bottom' && stateY === 1)
      ) {
        player.isMoving = false;

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

      newStateX = +newStateX.toFixed(1);
      newStateY = +newStateY.toFixed(1);

      requestAnimationFrame(() => this.renderMap(cornerX, cornerY, newStateX, newStateY, direction));
    } else if (movingObjects.length) {
      requestAnimationFrame(() => this.renderMap());
    }
  }

  renderCell({ cell, x, y, renderSelf, renderMoving }) {
    const {
      ctx,
      cellSize,
      images,
      player: {
        login: selfPlayerLogin
      }
    } = this;
    const cornerX = Math.floor(x * cellSize);
    const cornerY = Math.floor(y * cellSize);

    if (cell) {
      const {
        land: cellLand,
        building: cellBuilding,
        creature: cellCreature,
        move: isCreatureMoving
      } = cell;
      const imagesToDraw = [];

      if (cellLand) {
        imagesToDraw.push(images.land[cellLand]);
      }

      if (cellBuilding) {
        imagesToDraw.push(images.buildings[cellBuilding]);
      }

      if (cellCreature && (!isCreatureMoving || renderMoving)) {
        if (cellCreature.type !== 'player' || (cellCreature.type === 'player' && (cellCreature.login !== selfPlayerLogin || renderSelf))) {
          imagesToDraw.push(images.creatures[cellCreature.type].body);

          if (cellCreature.direction !== 'top') {
            imagesToDraw.push(images.creatures[cellCreature.type].eyes[cellCreature.direction]);
          }
        }
      }

      _.forEach(imagesToDraw, (image) => {
        ctx.drawImage(image, cornerX, cornerY, cellSize, cellSize);
      });
    } else {
      ctx.fillStyle = 'black';

      ctx.fillRect(cornerX, cornerY, cellSize, cellSize);
    }
  }

  onKeyDown = (e) => {
    const keyCodeActions = {
      65: 'left',
      68: 'right',
      87: 'top',
      83: 'bottom',
    };
    const keyCode = e.keyCode;
    const {
      player,
      player: {
        x: playerX,
        y: playerY
      },
      map
    } = this;

    //console.log(keyCode);

    const action = keyCodeActions[keyCode];

    if (!action || player.isMoving || Date.now() - player.lastMoveTimestamp < DELAY_BETWEEN_PLAYER_ACTIONS) return;

    player.lastMoveTimestamp = Date.now();

    const toX = playerX + (action === 'left' ? -1 : action === 'right' ? 1 : 0);
    const toY = playerY + (action === 'top' ? -1 : action === 'bottom' ? 1 : 0);
    const cellFrom = map[playerY][playerX];
    const cellTo = map[toY] && map[toY][toX];
    const isAbleToMove = cellTo && !cellTo.creature && !cellTo.building;

    this.emit(MOVE_TO, {
      toX: isAbleToMove ? toX : playerX,
      toY: isAbleToMove ? toY : playerY,
      fromX: playerX,
      fromY: playerY,
      direction: action
    });

    if (!isAbleToMove) return;

    let newCornerX;
    let newCornerY;
    let newStateX = 0;
    let newStateY = 0;
    const oldCorner = this.getCornerByMiddleCell({ x: playerX, y: playerY });
    const newCorner = this.getCornerByMiddleCell({ x: toX, y: toY });

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

      player.x = toX;
      player.y = toY;
      player.isMoving = true;
    }

    //console.log('Start moving: ', Date.now());

    this.renderMap(newCornerX, newCornerY, newStateX, newStateY, action);
  };

  onResize = () => {
    this.setSize();
    this.renderMap();
  };

  setSize() {
    this.cellSize = Math.floor(Math.min(window.innerHeight / pMapH, window.innerWidth / pMapW));
    this.canvas.width = this.cellSize * pMapW;
    this.canvas.height = this.cellSize * pMapH;
  }

  afterRender() {
    this.ctx = this.canvas.getContext('2d');
    this.setSize();

    this.removeOnKeydown = doc.on('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize, false);
  }

  beforeRemove() {
    this.removeOnKeydown();
    window.removeEventListener('resize', this.onResize, false);
  }

  getCornerByMiddleCell({ x, y }) {
    return {
      x: x - Math.floor(pMapW/2),
      y: y - Math.floor(pMapH/2)
    };
  }
}

Block.block('SurvivalGame', SurvivalGame.wrap(gameWrapper));
