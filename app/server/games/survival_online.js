const _ = require('lodash');
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
      },
      chunk: {
        width: chunkW,
        height: chunkH
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
    [GET_INITIAL_INFO]: 'onGetInitialInfo',
    [MOVE_TO]: 'onMoveTo'
  };

  prepareGame() {
    super.prepareGame();

    this.createMap();
    this.placePlayers();

    this.startGame();
  }

  onGetInitialInfo(data, { player }) {
    const {
      map
    } = this;
    const {
      x: playerX,
      y: playerY
    } = player;
    const {
      x: cornerX,
      y: cornerY
    } = this.getCornerByMiddleCell({ x: playerX, y: playerY });
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

  onMoveTo({ toX, toY, fromX, fromY, direction }, { player }) {
    const {
      x: playerX,
      y: playerY
    } = player;

    if (playerX !== fromX || playerY !== fromY) {
      return player.emit(REVERT_MOVE, { toX, toY, fromX, fromY });
    }

    const {
      map
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
      changedCells.push(cellFrom, { ...cellTo, move: { direction } });

      const prevChunk = this.getChunkByCoords({ x: fromX, y: fromY });
      const nextChunk = this.getChunkByCoords({ x: toX, y: toY });

      if (prevChunk !== nextChunk) {
        const playerIndex = _.findIndex(prevChunk.players, player);

        _.pullAt(prevChunk.players, playerIndex);
        nextChunk.players.push(player);

        console.log(prevChunk.players, nextChunk.players);
      }
    }

    cellTo.creature.direction = direction;

    _.forEach(this.players, (playerInGame) => {
      let cellsToSend = [];
      const additionalInfo = {};
      const {
        x: playerCornerX,
        y: playerCornerY
      } = this.getCornerByMiddleCell({ x: playerInGame.x, y: playerInGame.y });

      if (playerInGame.login !== player.login) {
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
        additionalInfo.approvedMove = { toX, toY };

        if (toX > fromX) {
          const cellX = playerCornerX + pMapW - 1;

          _.times(pMapH, (index) => {
            const cellY = playerCornerY + index;
            const cell = map[cellY] && map[cellY][cellX];

            if (cell) {
              cellsToSend.push(cell);
            }
          });
        } else if (toX < fromX) {
          const cellX = playerCornerX;

          _.times(pMapH, (index) => {
            const cellY = playerCornerY + index;

            const cell = map[cellY] && map[cellY][cellX];

            if (cell) {
              cellsToSend.push(cell);
            }
          });
        } else if (toY > fromY) {
          const cellY = playerCornerY + pMapH - 1;

          _.times(pMapW, (index) => {
            const cellX = playerCornerX + index;

            const cell = map[cellY] && map[cellY][cellX];

            if (cell) {
              cellsToSend.push(cell);
            }
          });
        } else if (toY < fromY) {
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
  }

  createChunks() {
    const chunks = this.chunks = [];
    const chunksH = mapH / chunkH;
    const chunksW = mapW / chunkW;

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
          players: []
        };
      });
    });

    _.times(chunksH, (y) => {
      _.times(chunksW, (x) => {
        const closeChunks = chunks[y][x].closeChunks;
        const topChunk = chunks[y - 1] && chunks[y - 1][x];
        const bottomChunk = chunks[y + 1] && chunks[y + 1][x];
        const rightChunk = chunks[y][x + 1] && chunks[y][x + 1];
        const leftChunk = chunks[y][x - 1] && chunks[y][x - 1];

        topChunk && closeChunks.push(topChunk);
        bottomChunk && closeChunks.push(bottomChunk);
        rightChunk && closeChunks.push(rightChunk);
        leftChunk && closeChunks.push(leftChunk);
      });
    });
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
        cell.building = 'tree';
      }
    });
  }

  placePlayers() {
    const map = this.map;
    let startX = Math.floor(mapW / 2);
    let startY = Math.floor(mapW / 2);

    _.forEach(this.players, (player) => {
      let isPlayerPlaced = false;

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

            const playerChunk = this.getChunkByCoords({ x: startX, y: startY });

            playerChunk.players.push(player);

            isPlayerPlaced = true;
          }
        }

        startX++;
      }
    });
  }

  getCornerByMiddleCell({ x, y }) {
    return {
      x: x - Math.floor(pMapW/2),
      y: y - Math.floor(pMapH/2)
    };
  }

  getChunkByCoords({ x, y }) {
    const chunkX = Math.floor(x / chunkW);
    const chunkY = Math.floor(y / chunkH);

    return this.chunks[chunkY][chunkX];
  }

  toJSON() {
    return {
      ...super.toJSON()
    };
  }
}

module.exports = SurvivalGame;
