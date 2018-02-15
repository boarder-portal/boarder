import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ClassName from 'classnames';

import { userType } from '../../constants';
import { deepMap, getInventoryIds } from '../../../shared/survival-online';
import { games as gamesConfig } from '../../../config/constants';

import Inventory from './Inventory';
import Promise from 'el-promise';

const {
  survival_online: {
    development: {
      SHOW_CHUNK_BORDER
    },
    events: {
      game: {
        GET_INITIAL_INFO,
        MOVE_TO,
        REVERT_MOVE,
        CHANGED_CELLS,
        CHANGE_INVENTORY_ITEMS_ORDER,
        CHANGE_INVENTORY_ITEMS,
        REMOVE_INVENTORY_ITEMS,
        USE_INVENTORY_ITEM
      }
    },
    inventory: {
      itemsCount: inventoryItemsCount
    },
    map: {
      width: mapW,
      height: mapH
    },
    playerMap: {
      width: pMapW,
      height: pMapH
    },
    chunk: {
      width: chunkW,
      height: chunkH
    },
    timers: {
      BETWEEN_CELL_DRAWING_MOVING,
      DELAY_BETWEEN_PLAYER_ACTIONS,
      DELAY_IN_PARTS_OF_SELF_MOVING
    },
    imagesPaths
  }
} = gamesConfig;

const imagesPathsAsArray = [];
const IMAGES_ROOT = '/public/images/games/survival_online';

deepMap(imagesPaths, (href) => {
  imagesPathsAsArray.push(href);
});

class SurvivalOnline extends Component {
  static listeners = {
    [GET_INITIAL_INFO]: 'onGetInitialInfo',
    [REVERT_MOVE]: 'onRevertMove',
    [CHANGED_CELLS]: 'onChangedCells',
    [CHANGE_INVENTORY_ITEMS]: 'onChangeInventoryItems',
    [REMOVE_INVENTORY_ITEMS]: 'onRemoveInventoryItems',
    unfrozenChunks: 'onUnfrozenChunks'
  };
  static propTypes = {
    user: userType.isRequired,
    emit: PropTypes.func.isRequired
  };

  state = {
    player: {
      inventory: _.times(inventoryItemsCount, () => ({ empty: true }))
    },
    fullScreenEnabled: false
  };
  imagesLoaded = false;
  loadImagesPromise = Promise
    .all(
      _.map(imagesPathsAsArray, (href) => (
        new Promise((resolve) => {
          const image = new Image();

          image.addEventListener('load', () => resolve(image));
          image.src = `${IMAGES_ROOT}/${href}`;
        })
      ))
    )
    .then((images) => {
      this.images = _.cloneDeep(imagesPaths);
      this.imagesLoaded = true;

      let index = 0;

      deepMap(this.images, (href, name, obj) => {
        obj[name] = images[index++];
      });
    });

  componentDidMount() {
    $(document).on('keydown', this.onKeyDown);
    $(document).on('webkitfullscreenchange mozfullscreenchange MSFullscreenChange', this.onFullScreenChange);
    $(window).on('resize', this.onResize);

    this.setSize();
    this.setup();
  }

  componentWillUnmount() {
    $(document).off('keydown', this.onKeyDown);
    $(document).off('webkitfullscreenchange mozfullscreenchange MSFullscreenChange', this.onFullScreenChange);
    $(window).off('resize', this.onResize);
  }

  rootNodeRef = (rootNode) => {
    this.rootNode = rootNode;
  };

  canvasRef = (canvas) => {
    if (!canvas) {
      return;
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  };

  onResize = () => {
    this.setSize();
  };

  onKeyDown = (e) => {
    const keyCodeActions = {
      65: 'left',
      68: 'right',
      87: 'top',
      83: 'bottom',
    };
    const keyCode = e.keyCode;
    const {
      state: {
        player,
        player: {
          x: playerX,
          y: playerY
        }
      },
      map
    } = this;

    //console.log(keyCode);

    const action = keyCodeActions[keyCode];

    if (!action || player.isMoving || Date.now() - player.lastMoveTimestamp < DELAY_BETWEEN_PLAYER_ACTIONS) return;

    e.preventDefault();

    player.lastMoveTimestamp = Date.now();
    player.direction = action;

    const toX = playerX + (action === 'left' ? -1 : action === 'right' ? 1 : 0);
    const toY = playerY + (action === 'top' ? -1 : action === 'bottom' ? 1 : 0);
    const cellFrom = map[playerY][playerX];
    const cellTo = map[toY] && map[toY][toX];
    const isAbleToMove = cellTo && !cellTo.creature && !cellTo.building;

    this.props.emit(MOVE_TO, {
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

    this.renderOptions.cornerX = newCornerX;
    this.renderOptions.cornerY = newCornerY;
    this.renderOptions.stateX = newStateX;
    this.renderOptions.stateY = newStateY;
    this.renderOptions.direction = action;
  };

  onFullScreenChange = () => {
    this.setState({
      fullScreenEnabled: !!(
        document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullScreenElement
        || document.msFullscreenElement
      )
    }, this.setSize);
  };

  requestFullScreen = () => {
    const elem = this.rootNode;

    (
      elem.requestFullScreen
      || elem.webkitRequestFullScreen
      || elem.webkitRequestFullscreen
      || elem.mozRequestFullScreen
      || elem.msRequestFullscreen
      || (() => {})
    ).call(elem);
  };

  setup() {
    this.props.emit(GET_INITIAL_INFO);

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
    this.renderOptions = {
      cornerX: null,
      cornerY: null,
      stateX: 0,
      stateY: 0,
      direction: null
    };
  }

  onGetInitialInfo = ({ playerMap, playerLocation, playerInventory }) => {
    console.log('Initial info: ', { playerMap, playerLocation, playerInventory });

    const {
      x: playerX,
      y: playerY
    } = playerLocation;
    const {
      map
    } = this;

    this.setState({
      player: {
        inventory: _.map(playerInventory, (item) => item || { empty: true }),
        x: playerX,
        y: playerY,
        lastApprovedPlayerX: playerX,
        lastApprovedPlayerY: playerY,
        direction: 'bottom'
      }
    });

    _.forEach(playerMap, (cell) => {
      map[cell.y][cell.x] = cell;
    });

    requestAnimationFrame(this.renderMap);
  };

  onRevertMove = ({ toX, toY, fromX, fromY }) => {
    console.log('Reverted: ', toX, toY, fromX, fromY);

    const player = this.state.player;

    player.x = player.lastApprovedPlayerX;
    player.y = player.lastApprovedPlayerY;
  };

  onChangedCells = ({ cells, additionalInfo }) => {
    //console.log('Changed cells: ', cells);
    const {
      state: {
        player
      },
      props: {
        user
      },
      map
    } = this;

    _.forEach(cells, (cell) => {
      if (cell.move) {
        if (cell.creature.login === user.login) {
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
  };

  onUnfrozenChunks = ({ unfrozenChunks }) => {
    this.unfrozenChunks = unfrozenChunks;
  };

  changeInventory = (newInventory) => {
    this.setState(({ player }) => {
      const oldInventoryIds = getInventoryIds(player.inventory);
      const newInventoryIds = getInventoryIds(newInventory);

      if (!_.isEqual(oldInventoryIds, newInventoryIds)) {
        this.props.emit(CHANGE_INVENTORY_ITEMS_ORDER, newInventoryIds);
      }

      return {
        player: {
          ...player,
          inventory: newInventory
        }
      };
    });
  };

  useInventoryItem = (index) => {
    const inventoryItem = this.state.player.inventory[index];

    if (inventoryItem && inventoryItem.usable) {
      this.props.emit(USE_INVENTORY_ITEM, inventoryItem.id);
    }
  };

  onChangeInventoryItems = (changedItems) => {
    this.setState(({ player, player: { inventory } }) => {
      _.forEach(changedItems, (changedItem) => {
        const changedIndex = _.findIndex(inventory, (item) => item && item.id === changedItem.id);

        if (changedIndex === -1) return;

        inventory = [
          ...inventory.slice(0, changedIndex),
          changedItem,
          ...inventory.slice(changedIndex + 1)
        ];
      });

      return {
        player: {
          ...player,
          inventory
        }
      };
    });
  };

  onRemoveInventoryItems = (removedIDs) => {
    this.setState(({ player, player: { inventory } }) => {
      _.forEach(removedIDs, (removedID) => {
        const removedIndex = _.findIndex(inventory, (item) => item && item.id === removedID);

        if (removedIndex === -1) return;

        inventory = [
          ...inventory.slice(0, removedIndex),
          { empty: true },
          ...inventory.slice(removedIndex + 1)
        ];
      });

      return {
        player: {
          ...player,
          inventory
        }
      };
    });
  };

  setSize = () => {
    let availableWidth = Math.max(window.innerWidth, 600);
    let availableHeight = Math.max(window.innerHeight - 150, 300);

    if (this.state.fullScreenEnabled) {
      availableWidth = window.outerWidth;
      availableHeight = window.outerHeight;
    }

    this.cellSize = Math.floor(Math.min(availableHeight / pMapH, availableWidth / pMapW));
    this.canvas.width = this.cellSize * pMapW;
    this.canvas.height = this.cellSize * pMapH;
  };

  getCornerByMiddleCell({ x, y }) {
    return {
      x: x - Math.floor(pMapW / 2),
      y: y - Math.floor(pMapH / 2)
    };
  }

  renderMap = () => {
    const t1 = Date.now();

    if (!this.imagesLoaded) {
      return this.loadImagesPromise.then(this.renderMap);
    }
    //console.log(...arguments, Date.now());

    let {
      renderOptions: {
        cornerX,
        cornerY,
        stateX,
        stateY,
        direction
      }
    } = this;
    const {
      props: {
        user
      },
      state: {
        player,
        player: {
          x: playerX,
          y: playerY
        }
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
          y: -stateY + y,
          renderSelf: false,
          renderMoving: false
        });

        if (cell && cell.creature && cell.move) {
          movingObjects.push({ ...cell, originalCell: cell, relativeX: x, relativeY: y });
        }

        if (cell && cell.creature && cell.creature.type === 'player' && cell.creature.login === user.login) {
          selfCell = cell;
        }
      });
    });

    _.forEach(movingObjects, (cell) => {
      const cellDirection = cell.move.direction;
      const cellMovingState = Math.min((Date.now() - cell.move.startMoving) / cell.move.speed, 1);
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

        this.renderOptions.cornerX = null;
        this.renderOptions.cornerY = null;
        this.renderOptions.stateX = null;
        this.renderOptions.stateY = null;
        this.renderOptions.direction = null;

        requestAnimationFrame(this.renderMap);

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

      this.renderOptions.stateX = newStateX;
      this.renderOptions.stateY = newStateY;
      this.renderOptions.direction = direction;
    } else if (movingObjects.length) {
      this.renderOptions.stateX = null;
      this.renderOptions.stateY = null;
      this.renderOptions.direction = null;
    }

    const t2 = Date.now();

    //console.log(t1, t2, t2 - t1);

    requestAnimationFrame(this.renderMap);
  };

  renderCell({ cell, x, y, renderSelf, renderMoving }) {
    const {
      ctx,
      cellSize,
      images,
      props: {
        user
      },
      state: {
        player: {
          direction: playerDirection
        }
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
        imagesToDraw.push(images.buildings[cellBuilding.type]);
      }

      if (cellCreature && (!isCreatureMoving || renderMoving)) {
        if (cellCreature.type !== 'player' || (cellCreature.type === 'player' && (cellCreature.login !== user.login || renderSelf))) {
          imagesToDraw.push(images.creatures[cellCreature.type].body);

          const creatureDirection = renderSelf ? playerDirection : cellCreature.direction;

          if (creatureDirection !== 'top') {
            imagesToDraw.push(images.creatures[cellCreature.type].eyes[creatureDirection]);
          }
        }
      }

      _.forEach(imagesToDraw, (image) => {
        ctx.drawImage(image, cornerX, cornerY, cellSize, cellSize);
      });

      if (SHOW_CHUNK_BORDER) {
        if (cell.x % chunkW === 0 || cell.y % chunkH === 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(cornerX, cornerY, cellSize, cellSize);
        }

        const chunkX = Math.floor(cell.x / chunkW);
        const chunkY = Math.floor(cell.y / chunkH);

        if (_.find(this.unfrozenChunks, ({ x, y }) =>  x === chunkX && y === chunkY)) {
          ctx.fillStyle = 'rgba(250, 0, 0, 0.5)';
          ctx.fillRect(cornerX, cornerY, cellSize, cellSize);
        }
      }
    } else {
      ctx.fillStyle = 'black';

      ctx.fillRect(cornerX, cornerY, cellSize, cellSize);
    }
  }

  render() {
    const {
      player,
      fullScreenEnabled
    } = this.state;

    return (
      <div
        ref={this.rootNodeRef}
        className={ClassName('survival-online-game', {
          fullscreen: fullScreenEnabled
        })}
      >

        <canvas ref={this.canvasRef} className="map" />

        <Inventory
          inventory={player.inventory}
          changeInventory={this.changeInventory}
          useInventoryItem={this.useInventoryItem}
        />

        <div className="fullscreen-icon" onClick={this.requestFullScreen}>
          <i className="fa fa-arrows-alt" />
        </div>

      </div>
    );
  }
}

export default connect((state) => ({
  user: state.user
}), null, null, { withRef: true })(SurvivalOnline);
