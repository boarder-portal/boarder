import { EGame } from 'common/types/game';
import { EDirection, EGameEvent, EObject, IPlayerData, IPlayerObject } from 'common/types/survivalOnline';

import Entity from 'server/gamesData/Game/utilities/Entity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/entities/SurvivalOnlineGame';

export interface IPlayerOptions {
  index: number;
  cell: IServerCell;
}

export default class Player extends Entity<EGame.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: IServerCellWithEntity<Player>;
  index: number;
  direction = EDirection.DOWN;

  constructor(game: SurvivalOnlineGame, options: IPlayerOptions) {
    super(game);

    this.game = game;
    this.index = options.index;
    this.cell = options.cell as IServerCellWithEntity<Player>;
  }

  *lifecycle() {
    this.game.placeEntity(this, this.cell);

    while (true) {
      const direction = yield* this.waitForPlayerSocketEvent(EGameEvent.MOVE_PLAYER, {
        playerIndex: this.index,
      });

      this.game.sendGameUpdate(this.game.moveEntityInDirection(this, direction), true);
    }
  }

  toPlayerData(): IPlayerData {
    return {
      cell: {
        ...this.game.transformCell(this.cell),
        object: this.toJSON(),
      },
    };
  }

  toJSON(): IPlayerObject {
    return {
      type: EObject.PLAYER,
      index: this.index,
      direction: this.direction,
    };
  }
}
