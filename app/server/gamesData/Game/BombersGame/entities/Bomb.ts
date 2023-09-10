import mapValues from 'lodash/mapValues';

import { SUPER_BOMB_DAMAGE, SUPER_BOMB_MAX_PIERCED_OBJECTS_COUNT } from 'common/constants/games/bombers';

import { Bomb as BombModel, Direction, ExplodedDirections, HitPlayer, Line, ObjectType } from 'common/types/bombers';
import { GameType } from 'common/types/game';

import Timestamp from 'common/utilities/Timestamp';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { ServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';
import Wall from 'server/gamesData/Game/BombersGame/entities/Wall';

export interface BombOptions {
  id: number;
  cell: ServerCell;
  range: number;
  explodesAt: Timestamp;
  isSuperBomb: boolean;
  isSuperRange: boolean;
}

export interface ExplosionResult {
  hitPlayers: HitPlayer[];
  explodedBoxes: Box[];
  destroyedWalls: Wall[];
  explodedDirections: ExplodedDirections;
}

const ALL_DIRECTIONS = Object.values(Direction);

export default class Bomb extends ServerEntity<GameType.BOMBERS> {
  game: BombersGame;

  id: number;
  cell: ServerCell;
  range: number;
  explodesAt: Timestamp;
  isSuperBomb: boolean;
  isSuperRange: boolean;

  explodeTrigger = this.createTrigger();

  constructor(game: BombersGame, options: BombOptions) {
    super(game);

    this.game = game;
    this.id = options.id;
    this.cell = options.cell;
    this.range = options.range;
    this.explodesAt = options.explodesAt;
    this.isSuperBomb = options.isSuperBomb;
    this.isSuperRange = options.isSuperRange;
  }

  *lifecycle(): EntityGenerator {
    yield* this.explodeTrigger;
  }

  explode(): ExplosionResult {
    this.explodeTrigger();

    const hitPlayers: HitPlayer[] = [];
    const explodedBoxes: Box[] = [];
    const destroyedWalls: Wall[] = [];
    const explodedDirections: Record<Line, { start: ServerCell; end: ServerCell }> = {
      [Line.HORIZONTAL]: {
        start: this.cell,
        end: this.cell,
      },
      [Line.VERTICAL]: {
        start: this.cell,
        end: this.cell,
      },
    };

    const playersOccupiedCells = this.game.players.map((player) => player.getOccupiedCells());

    const addCell = (cell: ServerCell, piercedObjectsCount: number, explodeWalls: boolean): void => {
      playersOccupiedCells.forEach((cells, playerIndex) => {
        if (cells.includes(cell)) {
          hitPlayers.push({
            index: playerIndex,
            damage: this.isSuperBomb ? Math.max(1, SUPER_BOMB_DAMAGE - piercedObjectsCount) : 1,
          });
        }
      });

      explodedBoxes.push(...cell.objects.filter(BombersGame.isBox));

      if (explodeWalls) {
        destroyedWalls.push(...cell.objects.filter(BombersGame.isWall));
      }
    };

    addCell(this.cell, 0, this.isSuperBomb);

    ALL_DIRECTIONS.forEach((direction) => {
      let currentCell: ServerCell = this.cell;
      let piercedObjectsCount = 0;

      for (let i = 0; i < this.range; i++) {
        const newCellInDirection = this.game.getCellBehind(currentCell, direction);

        if (!newCellInDirection) {
          break;
        }

        currentCell = newCellInDirection;

        const allObjectsPassable = currentCell.objects.every((object) => this.game.isExplosionPassableObject(object));
        const explodingObject = this.isSuperBomb && piercedObjectsCount < SUPER_BOMB_MAX_PIERCED_OBJECTS_COUNT;
        const explosionPassed = this.isSuperRange || explodingObject || allObjectsPassable;

        addCell(currentCell, piercedObjectsCount, explodingObject);

        if (explosionPassed || !currentCell.objects.some(BombersGame.isWall)) {
          const line = getDirectionLine(direction);

          if (direction === Direction.LEFT || direction === Direction.UP) {
            explodedDirections[line].start = currentCell;
          } else {
            explodedDirections[line].end = currentCell;
          }
        }

        if (explosionPassed && !allObjectsPassable) {
          piercedObjectsCount++;
        }

        if (!explosionPassed) {
          break;
        }
      }
    });

    return {
      hitPlayers,
      explodedBoxes,
      destroyedWalls,
      explodedDirections: mapValues(explodedDirections, ({ start, end }) => ({
        start: this.game.getCellCoords(start),
        end: this.game.getCellCoords(end),
      })),
    };
  }

  getCurrentTimestamps(): (Timestamp | null | undefined)[] {
    return [this.explodesAt];
  }

  toJSON(): BombModel {
    return {
      type: ObjectType.BOMB,
      id: this.id,
      range: this.range,
      explodesAt: this.explodesAt,
      isSuperBomb: this.isSuperBomb,
      isSuperRange: this.isSuperRange,
    };
  }
}
