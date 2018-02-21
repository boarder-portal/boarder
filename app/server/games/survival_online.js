import _ from 'lodash';

import Game from './';
import Zombie from '../../shared/games/survival-online/classes/Zombie';
import {
  getInventoryIds,
  areInventoryIdsSame,
  setFrozenStatusToNearChunks,
  shouldChunkBeFrozen,
  unfreezeChunkIfNeeded,
  countChunkDensity,
  getChunkByCoords,
  getCornerCoordsByMiddleCellCoords
} from '../../shared/games/survival-online';
import { games } from '../../shared/constants';

const {
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
      USE_INVENTORY_ITEM,
      CHANGE_TIME
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
  chunk: {
    width: chunkW,
    height: chunkH
  },
  timers: {
    DELAY_BETWEEN_PLAYER_ACTIONS
  },
  intervals: {
    CHANGE_TIME_INTERVAL
  },
  INITIAL_TIME,
  DAY_DURATION
} = games.survival_online;

const chunksH = mapH / chunkH;
const chunksW = mapW / chunkW;

const TEST_INVENTORY = [
  {
    id: 'asf7jg9',
    type: 'axe-stone',
    count: 34
  },
  {
    id: 'lknw6nb',
    type: 'cone',
    usable: true,
    count: 15
  },
  {
    id: 'nbls07h',
    type: 'hack-stone',
    count: 50
  },
  null,
  {
    id: 'jb5mgb0',
    type: 'meat',
    usable: true,
    count: 7
  },
  null,
  {
    id: 'vwp9n4n',
    type: 'torch',
    count: 89
  },
  null,
  null,
  {
    id: 'zkbpnr8',
    type: 'wood',
    count: 56
  }
];

/**
 * @class SurvivalGame
 * @extends Game
 * @public
 */
class SurvivalGame extends Game {
  constructor(args) {
    super(args);

    this.moveZombies = this.moveZombies.bind(this);
    this.freezeChunksIfNeeded = this.freezeChunksIfNeeded.bind(this);
    this.changeTime = this.changeTime.bind(this);
  }

  static listeners = {
    [GET_INITIAL_INFO]: 'onGetInitialInfo',
    [MOVE_TO]: 'onMoveTo',
    [CHANGE_INVENTORY_ITEMS_ORDER]: 'onChangeInventoryItemsOrder',
    [USE_INVENTORY_ITEM]: 'onUseInventoryItem'
  };

  prepareGame() {
    super.prepareGame();

    this.createMap();
    this.configurePlayers();
    this.initTimers();

    this.hour = INITIAL_TIME;

    this.startGame();
  }

  onGetInitialInfo(data, { player }) {
    const {
      map,
      hour
    } = this;
    const {
      x: playerX,
      y: playerY,
      inventory
    } = player;
    const {
      x: cornerX,
      y: cornerY
    } = getCornerCoordsByMiddleCellCoords({ x: playerX, y: playerY });
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
      playerLocation: {
        x: playerX,
        y: playerY
      },
      playerInventory: inventory,
      hour
    });
  }

  onMoveTo({ toX, toY, fromX, fromY, direction }, { player }) {
    const {
      x: playerX,
      y: playerY
    } = player;

    if (playerX !== fromX || playerY !== fromY) {
      return player.emit(REVERT_MOVE, { toX, toY, fromX, fromY });
    }

    const {
      map,
      chunks
    } = this;

    const changedCells = [];
    const cellFrom = map[fromY] && map[fromY][fromX];
    const cellTo = map[toY] && map[toY][toX];
    const isSameCell = fromX === toX && fromY === toY;

    if ((!cellTo || cellTo.creature || cellTo.building) && !isSameCell) {
      return player.emit(REVERT_MOVE, { toX, toY, fromX, fromY });
    }

    if (isSameCell) {
      changedCells.push(cellTo);
    } else {
      player.x = toX;
      player.y = toY;

      cellTo.creature = _.cloneDeep(cellFrom.creature);
      cellFrom.creature = null;
      changedCells.push(cellFrom, { ...cellTo, move: { direction, speed: DELAY_BETWEEN_PLAYER_ACTIONS } });

      const prevChunk = getChunkByCoords({ x: fromX, y: fromY, chunks });
      const nextChunk = getChunkByCoords({ x: toX, y: toY, chunks });

      if (prevChunk !== nextChunk) {
        const playerIndex = _.findIndex(prevChunk.players, player);

        _.pullAt(prevChunk.players, playerIndex);
        nextChunk.players.push(player);

        setFrozenStatusToNearChunks({ chunk: nextChunk, toFroze: false, actionSelf: true });
      }
    }

    cellTo.creature.direction = direction;
    player.direction = direction;

    this.sendChangedCells({ changedCells, movingPlayer: player });
  }

  onChangeInventoryItemsOrder(newIds, { player }) {
    const oldInventory = player.inventory;
    const oldIds = getInventoryIds(oldInventory);

    if (areInventoryIdsSame(oldIds, newIds)) {
      player.inventory = _.map(newIds, (id) => (
        _.find(oldInventory, (item) => item && item.id === id) || null
      ));
    }
  }

  onUseInventoryItem(id, { player }) {
    const playerInventory = player.inventory;
    const inventoryItemIndex = _.findIndex(playerInventory, (item) => item && item.id === id);
    const inventoryItem = playerInventory[inventoryItemIndex];

    if (!inventoryItem || !inventoryItem.usable) {
      return;
    }

    if (--inventoryItem.count) {
      this.emit(CHANGE_INVENTORY_ITEMS, [inventoryItem]);
    } else {
      playerInventory[inventoryItemIndex] = null;

      this.emit(REMOVE_INVENTORY_ITEMS, [id]);
    }
  }

  sendChangedCells({ changedCells, movingPlayer }) {
    const {
      players,
      map
    } = this;

    _.forEach(players, (playerInGame) => {
      let cellsToSend = [];
      const additionalInfo = {};
      const {
        x: playerCornerX,
        y: playerCornerY
      } = getCornerCoordsByMiddleCellCoords({ x: playerInGame.x, y: playerInGame.y });

      if (!movingPlayer || playerInGame.login !== movingPlayer.login) {
        _.forEach(changedCells, (cell) => {
          if (
            cell.x >= playerCornerX && cell.x < playerCornerX + pMapW
            && cell.y >= playerCornerY && cell.y < playerCornerY + pMapH
          ) {
            cellsToSend.push(cell);
          }
        });
      } else {
        cellsToSend = [...changedCells];

        const direction = movingPlayer.direction;

        additionalInfo.approvedMove = { toX: movingPlayer.x, toY: movingPlayer.y };

        switch (direction) {
          case 'right': {
            const cellX = playerCornerX + pMapW - 1;

            _.times(pMapH, (index) => {
              const cellY = playerCornerY + index;
              const cell = map[cellY] && map[cellY][cellX];

              if (cell) {
                cellsToSend.push(cell);
              }
            });

            break;
          }

          case 'left': {
            const cellX = playerCornerX;

            _.times(pMapH, (index) => {
              const cellY = playerCornerY + index;

              const cell = map[cellY] && map[cellY][cellX];

              if (cell) {
                cellsToSend.push(cell);
              }
            });

            break;
          }

          case 'bottom': {
            const cellY = playerCornerY + pMapH - 1;

            _.times(pMapW, (index) => {
              const cellX = playerCornerX + index;

              const cell = map[cellY] && map[cellY][cellX];

              if (cell) {
                cellsToSend.push(cell);
              }
            });

            break;
          }


          case 'top': {
            const cellY = playerCornerY;

            _.times(pMapW, (index) => {
              const cellX = playerCornerX + index;

              const cell = map[cellY] && map[cellY][cellX];

              if (cell) {
                cellsToSend.push(cell);
              }
            });
          }
        }
      }

      cellsToSend.length && playerInGame.emit(CHANGED_CELLS, { cells: cellsToSend, additionalInfo });
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

    const map = this.map;

    this.createChunks();
    this.placeBuildings();
    this.placeCreatures();
    this.unfreezeActiveChunks();
  }

  createChunks() {
    const chunks = this.chunks = [];

    if ((chunksH) % 1 !== 0 || (chunksW) % 1 !== 0) {
      throw new Error('Chunk width or height is wrong!');
    }

    _.times(chunksH, (y) => {
      chunks[y] = chunks[y] || [];

      _.times(chunksW, (x) => {
        chunks[y][x] = {
          x,
          y,
          closeChunks: [],
          players: [],
          zombies: [],
          isFrozen: true,
          timestampLastSetUnfrozen: Date.now(),
          lastZombiesMoved: Date.now()
        };
      });
    });

    _.times(chunksH, (y) => {
      _.times(chunksW, (x) => {
        const closeChunks = chunks[y][x].closeChunks;
        const topLeftChunk = chunks[y - 1] && chunks[y - 1][x - 1];
        const topChunk = chunks[y - 1] && chunks[y - 1][x];
        const topRightChunk = chunks[y - 1] && chunks[y - 1][x + 1];
        const leftChunk = chunks[y] && chunks[y][x - 1];
        const rightChunk = chunks[y] && chunks[y][x + 1];
        const bottomLeftChunk = chunks[y + 1] && chunks[y + 1][x - 1];
        const bottomChunk = chunks[y + 1] && chunks[y + 1][x];
        const bottomRightChunk = chunks[y + 1] && chunks[y + 1][x + 1];

        topLeftChunk && closeChunks.push(topLeftChunk);
        topChunk && closeChunks.push(topChunk);
        topRightChunk && closeChunks.push(topRightChunk);
        leftChunk && closeChunks.push(leftChunk);
        rightChunk && closeChunks.push(rightChunk);
        bottomLeftChunk && closeChunks.push(bottomLeftChunk);
        bottomChunk && closeChunks.push(bottomChunk);
        bottomRightChunk && closeChunks.push(bottomRightChunk);
      });
    });
  }

  unfreezeActiveChunks() {
    const chunks = this.chunks;

    _.times(chunksH, (y) => {
      _.times(chunksW, (x) => {
        const chunk = chunks[y][x];

        chunk.density = countChunkDensity(chunk);

        unfreezeChunkIfNeeded({ chunk });
      });
    });
  }

  initTimers() {
    setInterval(this.freezeChunksIfNeeded, 1000);
    setInterval(this.moveZombies, 100);
    setInterval(this.changeTime, CHANGE_TIME_INTERVAL);
  }

  freezeChunksIfNeeded() {
    const {
      chunks
    } = this;

    const nowTimestamp = Date.now();
    const unfrozenChunks = [];

    _.times(chunksH, (y) => {
      _.times(chunksW, (x) => {
        const chunk = chunks[y][x];

        chunk.density = countChunkDensity(chunk);

        if (chunk.isFrozen) return;

        SHOW_CHUNK_BORDER && unfrozenChunks.push({ x, y });

        if (nowTimestamp - chunk.timestampLastSetUnfrozen > 10000) {
          if (shouldChunkBeFrozen(chunk)) {
            chunk.isFrozen = true;

            return;
          }

          chunk.timestampLastSetUnfrozen = nowTimestamp;
        }
      });
    });

    if (SHOW_CHUNK_BORDER) {
      _.forEach(this.players, (player) => {
        player.emit('unfrozenChunks', {
          unfrozenChunks
        });
      });
    }
    //console.log(unfrozenChunks.length);
  }

  moveZombies() {
    const {
      chunks
    } = this;

    const changedCells = [];
    const nowTimestamp = Date.now();

    _.times(chunksH, (y) => {
      _.times(chunksW, (x) => {
        const chunk = chunks[y][x];

        if (chunk.isFrozen && nowTimestamp - chunk.lastZombiesMoved < Math.max(15000 - 50 * chunk.density, 0)) return;

        _.forEach(chunk.zombies, (zombie) => {
          if (!zombie || nowTimestamp - zombie.lastMovedTimestamp < 1000 + Math.floor(Math.random() * 200)) return;

          const { changedCells: localChangedCells } = zombie.move();

          changedCells.push(...localChangedCells);
        });

        chunk.lastZombiesMoved = nowTimestamp;
      });
    });

    changedCells.length && this.sendChangedCells({ changedCells });
  }

  changeTime() {
    this.hour++;

    if (this.hour === DAY_DURATION) {
      this.hour = 0;
    }

    this.emit(CHANGE_TIME, { hour: this.hour });
  }

  placeBuildings() {
    const {
      map
    } = this;

    _.times(Math.floor(mapH * mapW * 0.1), () => {
      const randX = Math.floor(Math.random() * mapW);
      const randY = Math.floor(Math.random() * mapH);

      const cell = map[randY][randX];

      if (cell.land === 'grass' && !cell.creature && !cell.building) {
        cell.building = {
          type: 'tree'
        };
      }
    });
  }

  configurePlayers() {
    const {
      map,
      chunks,
      players
    } = this;
    let startX = Math.floor(mapW / 2);
    let startY = Math.floor(mapW / 2);

    _.forEach(players, (player) => {
      let isPlayerPlaced = false;

      player.inventory = _.cloneDeep(TEST_INVENTORY);

      while (!isPlayerPlaced) {
        if (map[startY] && map[startY][startX]) {
          const cell = map[startY][startX];

          if (!cell.creature && !cell.building) {
            cell.creature = {
              type: 'player',
              login: player.login,
              direction: 'bottom'
            };

            player.x = startX;
            player.y = startY;
            player.direction = 'bottom';

            const playerChunk = getChunkByCoords({ x: startX, y: startY, chunks });

            playerChunk.players.push(player);

            setFrozenStatusToNearChunks({ chunk: playerChunk, toFroze: false, actionSelf: true });

            isPlayerPlaced = true;
          }
        }

        startX++;
      }
    });
  }

  placeCreatures() {
    const {
      map,
      chunks
    } = this;

    _.times(10 /*|| Math.floor(mapH * mapW * 0.01)*/, () => {
      const randX = Math.floor(Math.random() * mapW);
      const randY = Math.floor(Math.random() * mapH);

      const cell = map[randY][randX];

      if (cell.land === 'grass' && !cell.creature && !cell.building) {
        const zombie = new Zombie({
          map,
          chunks,
          x: randX,
          y: randY
        });
      }
    });
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

export default SurvivalGame;
