import mapValues from 'lodash/mapValues';

import { EGame } from 'common/types/game';
import { EDirection, ELine, EObject, IBomb, TExplodedDirections } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import getDirectionLine from 'common/utilities/bombers/getDirectionLine';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';
import Box from 'server/gamesData/Game/BombersGame/entities/Box';

export interface IBombOptions {
  cell: IServerCell;
  range: number;
  explodesAt: number;
}

export interface IExplosionResult {
  hitPlayers: number[];
  explodedBoxes: Box[];
  explodedDirections: TExplodedDirections;
}

const ALL_DIRECTIONS = Object.values(EDirection);

export default class Bomb extends ServerEntity<EGame.BOMBERS> {
  game: BombersGame;

  cell: IServerCell;
  range: number;
  explodesAt: number;

  explodeTrigger = this.createTrigger();

  constructor(game: BombersGame, options: IBombOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell;
    this.range = options.range;
    this.explodesAt = options.explodesAt;
  }

  *lifecycle(): TGenerator {
    yield* this.explodeTrigger;
  }

  explode(): IExplosionResult {
    this.explodeTrigger();

    const hitPlayers: number[] = [];
    const explodedBoxes: Box[] = [];
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

    const addCell = (cell: IServerCell): void => {
      playersOccupiedCells.forEach((cells, playerIndex) => {
        if (cells.includes(cell)) {
          hitPlayers.push(playerIndex);
        }
      });

      if (cell.object instanceof Box) {
        explodedBoxes.push(cell.object);
      }
    };

    addCell(this.cell);

    ALL_DIRECTIONS.forEach((direction) => {
      let currentCell: IServerCell = this.cell;

      for (let i = 0; i < this.range; i++) {
        const newCellInDirection = this.game.getCellBehind(currentCell, direction);

        if (!newCellInDirection) {
          break;
        }

        currentCell = newCellInDirection;

        addCell(currentCell);

        const line = getDirectionLine(direction);

        if (direction === EDirection.LEFT || direction === EDirection.UP) {
          explodedDirections[line].start = currentCell;
        } else {
          explodedDirections[line].end = currentCell;
        }

        if (!this.game.isExplosionPassableObject(currentCell.object)) {
          break;
        }
      }
    });

    return {
      hitPlayers,
      explodedBoxes,
      explodedDirections: mapValues(explodedDirections, ({ start, end }) => ({
        start: this.game.getCellCoords(start),
        end: this.game.getCellCoords(end),
      })),
    };
  }

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      range: this.range,
      explodesAt: this.explodesAt,
    };
  }
}
