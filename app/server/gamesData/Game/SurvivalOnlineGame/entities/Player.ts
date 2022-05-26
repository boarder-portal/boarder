import { EGame } from 'common/types/game';
import { EDirection, EGameClientEvent, EObject, IPlayerData, IPlayerObject } from 'common/types/survivalOnline';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity from 'server/gamesData/Game/utilities/PlayerEntity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface IPlayerOptions {
  index: number;
  cell: IServerCell;
}

export default class Player extends PlayerEntity<EGame.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: IServerCellWithEntity<Player>;
  index: number;
  direction = EDirection.DOWN;

  constructor(game: SurvivalOnlineGame, options: IPlayerOptions) {
    super(game, options);

    this.game = game;
    this.index = options.index;
    this.cell = options.cell as IServerCellWithEntity<Player>;
  }

  *lifecycle(): TGenerator {
    yield* this.spawnTask(this.listenForEvents());

    yield* this.eternity();
  }

  *listenForEvents(): TGenerator {
    yield* this.all([
      this.listenForOwnEvent(EGameClientEvent.MOVE_PLAYER, (direction) => {
        this.game.sendGameUpdate(this.game.moveEntityInDirection(this, direction), true);
      }),
    ]);
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
