const _ = require('lodash');
const {
  games: {
    survival_online: {
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
      CANT_SEE_THROUGH
    }
  }
} = require('../../../config/constants.json');
const {
  unfreezeChunkIfNeeded,
  shouldChunkBeFrozen
} = require('../index');

class Creature {
  constructor({ x, y, health, type, direction, map, chunks }) {
    this.x = x;
    this.y = y;
    this.health = health;
    this.direction = direction;
    this.type = type;
    this.map = map;
    this.chunks = chunks;
    this.chunk = this.getChunkByCoords({ x, y });
    this.lastMovedTimestamp = Date.now();
  }

  changeChunkIfNeeded() {
    const {
      type: creatureType
    } = this;
    const chunkGroup = creatureType + 's';
    const prevChunk = this.chunk;
    const nextChunk = this.getChunkByCoords({ x: this.x, y: this.y });

    if (prevChunk !== nextChunk) {
      const creatureIndex = _.findIndex(prevChunk[chunkGroup], this);

      _.pullAt(prevChunk[chunkGroup], creatureIndex);
      nextChunk[chunkGroup].push(this);

      this.chunk = nextChunk;

      if (!shouldChunkBeFrozen(prevChunk) || !shouldChunkBeFrozen(nextChunk)) {
        unfreezeChunkIfNeeded({ chunk: nextChunk, forceSet: true });
      }
    }
  }

  getChunkByCoords({ x, y }) {
    const chunkX = Math.floor(x / chunkW);
    const chunkY = Math.floor(y / chunkH);

    return this.chunks[chunkY][chunkX];
  }

  directionToProjection(direction) {
    if (direction === 'top' || direction === 'left') {
      return -1;
    } else if (direction === 'right' || direction === 'bottom') {
      return 1;
    }
  }

  getDistanceBetweenCoords({ x1, y1, x2, y2 }) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  getIsClearBetweenCoords({ x1, y1, x2, y2 }) {
    const { map } = this;
    const xDiff = Math.abs(x1 - x2);
    const yDiff = Math.abs(y1 - y2);
    const angle = Math.min(xDiff, yDiff) / Math.max(xDiff, yDiff);

    if (xDiff >= yDiff) {
      const to = Math.abs(x2 - x1);

      for (let i = 1; i < to; i++) {
        const x = x1 + (x2 > x1 ? i : -i);
        const y = y1 + (y1 >= y2 ? -Math.round(angle*i) : Math.round(angle*i));
        const cell = map[y][x];

        if (cell && (!cell.building || (cell.building && !~_.indexOf(CANT_SEE_THROUGH, cell.building.type)))) {
          if (i === to - 1) {
            return true;
          }
        } else {
          return false;
        }
      }

      return true;
    } else {
      const to = Math.abs(y2 - y1);

      for (let i = 1; i < to; i++) {
        const x = x1 + (x1 >= x2 ? -Math.round(angle*i) : Math.round(angle*i));
        const y = y1 + (y2 > y1 ? i : -i);
        const cell = map[y][x];

        if (cell && (!cell.building || (cell.building && !~_.indexOf(CANT_SEE_THROUGH, cell.building.type)))) {
          if (i === to - 1) {
            return true;
          }
        } else {
          return false;
        }
      }

      return true;
    }
  }

  getToDirectionByCoordOdds({ xDiff, yDiff }) {
    if (xDiff === 0) {
      if (yDiff < 0) {
        return 'top';
      } else {
        return 'bottom';
      }
    } else if (xDiff > 0) {
      if (yDiff < 0) {
        return _.sample(['top', 'right']);
      } else if (yDiff === 0) {
        return 'right';
      } else {
        return _.sample(['bottom', 'right']);
      }
    } else {
      if (yDiff < 0) {
        return _.sample(['top', 'left']);
      } else if (yDiff === 0) {
        return 'left';
      } else {
        return _.sample(['bottom', 'left']);
      }
    }
  }
}

module.exports = Creature;
