import { EGame } from 'common/types/game';
import { EDirection, EGameClientEvent, EObject, IPlayerData, IPlayerObject } from 'common/types/survivalOnline';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface IPlayerOptions {
  index: number;
  cell: IServerCell;
}

export default class Player extends ServerEntity<EGame.SURVIVAL_ONLINE> {
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

  *lifecycle(): TGenerator {
    while (true) {
      const direction = yield* this.waitForPlayerSocketEvent(EGameClientEvent.MOVE_PLAYER, {
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
