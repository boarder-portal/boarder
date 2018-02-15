const _ = require('lodash');
const {
  games: {
    survival_online: {
      limits: {
        densityForChunkToNotBeFrozen: DENSITY_FOR_NOT_TO_BE_FROZEN
      },
      development: {
        SHOW_CHUNK_BORDER
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
      CANT_SEE_THROUGH
    }
  }
} = require('../../config/constants.json');

function getInventoryIds(inventory) {
  return _.map(inventory, (item) => item && item.id);
}

function areInventoryIdsSame(ids1, ids2) {
  return _.every(ids1, (id) => !id || _.includes(ids2, id)) && _.every(ids2, (id) => !id || _.includes(ids1, id));
}

function deepMap(obj, f, ctx) {
  if (Array.isArray(obj)) {
    return obj.map(function(val, key) {
      return (typeof val === 'object') ? deepMap(val, f, ctx) : f.call(ctx, val, key, obj);
    });
  } else if (typeof obj === 'object') {
    const res = {};
    for (let key in obj) {
      const val = obj[key];
      if (typeof val === 'object') {
        res[key] = deepMap(val, f, ctx);
      } else {
        res[key] = f.call(ctx, val, key, obj);
      }
    }
    return res;
  } else {
    return obj;
  }
}

function setFrozenStatusToNearChunks({ chunk: centerChunk, toFroze, actionSelf }) {
  const chunksToSet = [...centerChunk.closeChunks];

  if (actionSelf) {
    chunksToSet.push(centerChunk);
  }

  _.forEach(chunksToSet, (chunk) => {
    chunk.isFrozen = toFroze;

    if (!toFroze) {
      chunk.timestampLastSetUnfrozen = Date.now();
    }
  });
}

function countChunkDensity(chunk) {
  const {
    players,
    zombies
  } = chunk;

  return players.length * 10000 + zombies.length * 10;
}

function shouldChunkBeFrozen(centerChunk)  {
  let density = countChunkDensity(centerChunk);

  if (density >= DENSITY_FOR_NOT_TO_BE_FROZEN) return false;

  _.forEach(centerChunk.closeChunks, (chunk) => {
    density+= countChunkDensity(chunk) * 0.8;

    if (density >= DENSITY_FOR_NOT_TO_BE_FROZEN) return false;
  });

  return density < DENSITY_FOR_NOT_TO_BE_FROZEN;
}

function unfreezeChunkIfNeeded({ chunk, forceSet }) {
  if (forceSet || !shouldChunkBeFrozen(chunk)) {
    chunk.isFrozen = false;
    chunk.timestampLastSetUnfrozen = Date.now();
  }
}

function getRandomDirection() {
  return _.sample(['top', 'right', 'bottom', 'left']);
}

function getChunkByCoords({ chunks, x, y } ) {
  const chunkX = Math.floor(x / chunkW);
  const chunkY = Math.floor(y / chunkH);

  return chunks[chunkY][chunkX];
}

function getCornerCoordsByMiddleCellCoords({ x, y }) {
  return {
    x: x - Math.floor(pMapW / 2),
    y: y - Math.floor(pMapH / 2)
  };
}

function getProjectionByDirection(direction) {
  if (direction === 'top' || direction === 'left') {
    return -1;
  } else if (direction === 'right' || direction === 'bottom') {
    return 1;
  }
}

function getDistanceBetweenCoords({ x1, y1, x2, y2 }) {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

function getIsClearBetweenCoords({ x1, y1, x2, y2, map }) {
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

function getToDirectionByCoordOdds({ xDiff, yDiff }) {
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

function getToDirectionBetweenTargets({ targetFrom, targetTo }) {
  const {
    x: fromX,
    y: fromY
  } = targetFrom;

  const {
    x: toX,
    y: toY
  } = targetTo;

  return getToDirectionByCoordOdds({ xDiff: toX - fromX, yDiff: toY - fromY });
}

exports.getInventoryIds = getInventoryIds;
exports.areInventoryIdsSame = areInventoryIdsSame;
exports.deepMap = deepMap;
exports.setFrozenStatusToNearChunks = setFrozenStatusToNearChunks;
exports.countChunkDensity = countChunkDensity;
exports.shouldChunkBeFrozen = shouldChunkBeFrozen;
exports.unfreezeChunkIfNeeded = unfreezeChunkIfNeeded;
exports.getRandomDirection = getRandomDirection;
exports.getChunkByCoords = getChunkByCoords;
exports.getCornerCoordsByMiddleCellCoords = getCornerCoordsByMiddleCellCoords;
exports.getProjectionByDirection = getProjectionByDirection;
exports.getDistanceBetweenCoords = getDistanceBetweenCoords;
exports.getIsClearBetweenCoords = getIsClearBetweenCoords;
exports.getToDirectionByCoordOdds = getToDirectionByCoordOdds;
exports.getToDirectionBetweenTargets = getToDirectionBetweenTargets;
