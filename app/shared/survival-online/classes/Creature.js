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
      }
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
}

module.exports = Creature;
