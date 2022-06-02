import { EGame } from 'common/types/game';
import { EDirection, EObject, IBomb } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

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

        if (!this.game.isExplosionPassableObject(currentCell.object)) {
          break;
        }
      }
    });

    return { hitPlayers, explodedBoxes };
  }

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      range: this.range,
      explodesAt: this.explodesAt,
    };
  }
}
