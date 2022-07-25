import mapValues from 'lodash/mapValues';

import { SUPER_BOMB_DAMAGE, SUPER_BOMB_MAX_PIERCED_OBJECTS_COUNT } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EDirection, ELine, EObject, IBomb, IHitPlayer, TExplodedDirections } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';
import Wall from 'server/gamesData/Game/BombersGame/entities/Wall';

export interface IBombOptions {
  id: number;
  cell: IServerCell;
  range: number;
  explodesAt: number;
  isSuperBomb: boolean;
  isSuperRange: boolean;
}

export interface IExplosionResult {
  hitPlayers: IHitPlayer[];
  explodedBoxes: Box[];
  destroyedWalls: Wall[];
  explodedDirections: TExplodedDirections;
}

const ALL_DIRECTIONS = Object.values(EDirection);

export default class Bomb extends ServerEntity<EGame.BOMBERS> {
  game: BombersGame;

  id: number;
  cell: IServerCell;
  range: number;
  explodesAt: number;
  isSuperBomb: boolean;
  isSuperRange: boolean;

  explodeTrigger = this.createTrigger();

  constructor(game: BombersGame, options: IBombOptions) {
    super(game);

    this.game = game;
    this.id = options.id;
    this.cell = options.cell;
    this.range = options.range;
    this.explodesAt = options.explodesAt;
    this.isSuperBomb = options.isSuperBomb;
    this.isSuperRange = options.isSuperRange;
  }

  *lifecycle(): TGenerator {
    yield* this.explodeTrigger;
  }

  explode(): IExplosionResult {
    this.explodeTrigger();

    const hitPlayers: IHitPlayer[] = [];
    const explodedBoxes: Box[] = [];
    const destroyedWalls: Wall[] = [];
    const explodedDirections: Record<ELine, { start: IServerCell; end: IServerCell }> = {
      [ELine.HORIZONTAL]: {
        start: this.cell,
        end: this.cell,
      },
      [ELine.VERTICAL]: {
        start: this.cell,
        end: this.cell,
      },
    };

    const playersOccupiedCells = this.game.players.map((player) => player.getOccupiedCells());

    const addCell = (cell: IServerCell, piercedObjectsCount: number, explodeWalls: boolean): void => {
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
      let currentCell: IServerCell = this.cell;
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

          if (direction === EDirection.LEFT || direction === EDirection.UP) {
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

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      id: this.id,
      range: this.range,
      explodesAt: this.explodesAt,
      isSuperBomb: this.isSuperBomb,
      isSuperRange: this.isSuperRange,
    };
  }
}
