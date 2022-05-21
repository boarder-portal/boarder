import { EGame } from 'common/types/game';
import { EDirection, EObject, IZombieObject } from 'common/types/survivalOnline';

import Entity from 'server/gamesData/Game/utilities/Entity';
import { getRandomElement } from 'common/utilities/random';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface IZombieOptions {
  cell: IServerCell;
}

export default class Zombie extends Entity<EGame.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: IServerCellWithEntity<Zombie>;
  direction = EDirection.DOWN;

  constructor(game: SurvivalOnlineGame, options: IZombieOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as IServerCellWithEntity<Zombie>;
  }

  *lifecycle() {
    this.game.placeEntity(this, this.cell);

    yield* this.eternity();
  }

  move(): IServerCell[] {
    let closestPlayer = this.game.players[0];
    let closestPlayerDistance = Infinity;

    this.game.players.forEach((player) => {
      const distance = Math.abs(this.cell.x - player.cell.x) + Math.abs(this.cell.y - player.cell.y);

      if (distance < closestPlayerDistance) {
        closestPlayer = player;
        closestPlayerDistance = distance;
      }
    });

    const possibleDirections: EDirection[] = [];

    if (this.cell.x !== closestPlayer.cell.x) {
      possibleDirections.push(this.cell.x < closestPlayer.cell.x ? EDirection.RIGHT : EDirection.LEFT);
    }

    if (this.cell.y !== closestPlayer.cell.y) {
      possibleDirections.push(this.cell.y < closestPlayer.cell.y ? EDirection.DOWN : EDirection.UP);
    }

    const changedCells = this.game.moveEntityInDirection(this, getRandomElement(possibleDirections));

    this.cell = changedCells[1] ?? this.cell;

    return changedCells;
  }

  toJSON(): IZombieObject {
    return {
      type: EObject.ZOMBIE,
      direction: this.direction,
    };
  }
}
