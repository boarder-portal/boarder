import _ from 'lodash';

import Creature from './Creature';
import { games } from '../../../constants';
import {
  getProjectionByDirection,
  getDistanceBetweenCoords,
  getIsClearBetweenCoords,
  getToDirectionBetweenTargets,
  getRandomDirection
} from '../';

const {
  zombie: {
    vision: ZOMBIE_VISION,
    speed: ZOMBIE_SPEED
  }
} = games.survival_online;

class Zombie extends Creature {
  constructor(options) {
    super({
      type: 'zombie',
      hp: 100,
      direction: 'bottom',
      ...options
    });

    this.chunk.zombies.push(this);
  }

  move() {
    const {
      map,
      x: fromX,
      y: fromY
    } = this;

    const changedCells = [];

    let closestDistance = 10e3;
    let closestTarget = null;

    _.forEach([this.chunk, ...this.chunk.closeChunks], (closeChunk) => {
      _.forEach(closeChunk.players, (player) => {
        const distanceToPlayer = getDistanceBetweenCoords({ x1: fromX, y1: fromY, x2: player.x, y2: player.y });

        if (distanceToPlayer > closestDistance) return;

        if (distanceToPlayer <= ZOMBIE_VISION) {
          const isZombieSeePlayer = getIsClearBetweenCoords({ x1: fromX, y1: fromY, x2: player.x, y2: player.y, map });

          if (isZombieSeePlayer) {
            closestDistance = distanceToPlayer;
            closestTarget = player;
          }
        }
      });
    });

    const direction = closestTarget
      ? getToDirectionBetweenTargets({ targetFrom: this, targetTo: closestTarget })
      : getRandomDirection();

    const toX = (direction === 'right' || direction === 'left') ? this.x + getProjectionByDirection(direction) : this.x;
    const toY = (direction === 'top' || direction === 'bottom') ? this.y + getProjectionByDirection(direction) : this.y;

    const cellFrom = map[fromY] && map[fromY][fromX];
    const cellTo = map[toY] && map[toY][toX];

    cellFrom.creature.direction = direction;
    changedCells.push(cellFrom);

    if (cellTo && !cellTo.building && !cellTo.creature) {
      this.x = toX;
      this.y = toY;

      cellTo.creature = cellFrom.creature;
      cellFrom.creature = null;

      changedCells.push({ ...cellTo, move: { direction, speed: ZOMBIE_SPEED } });

      this.changeChunkIfNeeded();
    }

    this.lastMovedTimestamp = Date.now();

    return { changedCells };
  }

  toJSON() {
    const {
      x,
      y,
      type,
      direction
    } = this;

    return {
      x,
      y,
      type,
      direction
    };
  }
}

export default Zombie;
