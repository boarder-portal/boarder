import { GameType } from 'common/types/game';
import { Direction, ObjectType, ZombieObject } from 'common/types/games/survivalOnline';

import { EntityGenerator } from 'common/utilities/Entity';
import { getRandomElement } from 'common/utilities/random';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SurvivalOnlineGame, {
  ServerCell,
  ServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface ZombieOptions {
  cell: ServerCell;
}

export default class Zombie extends ServerEntity<GameType.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: ServerCellWithEntity<Zombie>;
  direction = Direction.DOWN;

  constructor(game: SurvivalOnlineGame, options: ZombieOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as ServerCellWithEntity<Zombie>;
  }

  *lifecycle(): EntityGenerator {
    yield* this.eternity();
  }

  move(): ServerCell[] {
    let closestPlayer = this.game.players[0];
    let closestPlayerDistance = Infinity;

    this.game.players.forEach((player) => {
      const distance = Math.abs(this.cell.x - player.cell.x) + Math.abs(this.cell.y - player.cell.y);

      if (distance < closestPlayerDistance) {
        closestPlayer = player;
        closestPlayerDistance = distance;
      }
    });

    const possibleDirections: Direction[] = [];

    if (this.cell.x !== closestPlayer.cell.x) {
      possibleDirections.push(this.cell.x < closestPlayer.cell.x ? Direction.RIGHT : Direction.LEFT);
    }

    if (this.cell.y !== closestPlayer.cell.y) {
      possibleDirections.push(this.cell.y < closestPlayer.cell.y ? Direction.DOWN : Direction.UP);
    }

    const changedCells = this.game.moveEntityInDirection(this, getRandomElement(possibleDirections));

    this.cell = changedCells[1] ?? this.cell;

    return changedCells;
  }

  toJSON(): ZombieObject {
    return {
      type: ObjectType.ZOMBIE,
      direction: this.direction,
    };
  }
}
