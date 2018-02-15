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
  shouldChunkBeFrozen,
  getChunkByCoords
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
    this.chunk = getChunkByCoords({ x, y, chunks });
    this.lastMovedTimestamp = Date.now();

    const cell = map[y][x];

    cell.creature = this;
  }

  changeChunkIfNeeded() {
    const {
      type: creatureType,
      chunks
    } = this;
    const chunkGroup = creatureType + 's';
    const prevChunk = this.chunk;
    const nextChunk = getChunkByCoords({ x: this.x, y: this.y, chunks });

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
}

module.exports = Creature;
