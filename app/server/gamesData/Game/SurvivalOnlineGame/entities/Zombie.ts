import { EGame } from 'common/types/game';
import { EDirection, EObject, IZombieObject } from 'common/types/survivalOnline';

import Entity from 'server/gamesData/Game/utilities/Entity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/entities/SurvivalOnlineGame';

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

  toJSON(): IZombieObject {
    return {
      type: EObject.ZOMBIE,
      direction: this.direction,
    };
  }
}
