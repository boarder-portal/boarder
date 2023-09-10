import { GameType } from 'common/types/game';
import { Direction, GameClientEventType, ObjectType, PlayerData, PlayerObject } from 'common/types/survivalOnline';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import PlayerEntity, { PlayerOptions as CommonPlayerOptions } from 'server/gamesData/Game/utilities/PlayerEntity';

import SurvivalOnlineGame, {
  ServerCell,
  ServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface PlayerOptions extends CommonPlayerOptions {
  cell: ServerCell;
}

export default class Player extends PlayerEntity<GameType.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: ServerCellWithEntity<Player>;
  direction = Direction.DOWN;

  constructor(game: SurvivalOnlineGame, options: PlayerOptions) {
    super(game, options);

    this.game = game;
    this.cell = options.cell as ServerCellWithEntity<Player>;
  }

  *lifecycle(): EntityGenerator {
    this.spawnTask(this.listenForEvents());

    yield* this.eternity();
  }

  *listenForEvents(): EntityGenerator {
    yield* this.all([
      this.listenForOwnEvent(GameClientEventType.MOVE_PLAYER, (direction) => {
        this.game.sendGameUpdate(this.game.moveEntityInDirection(this, direction), true);
      }),
    ]);
  }

  toPlayerData(): PlayerData {
    return {
      cell: {
        ...this.game.transformCell(this.cell),
        object: this.toJSON(),
      },
    };
  }

  toJSON(): PlayerObject {
    return {
      type: ObjectType.PLAYER,
      index: this.index,
      direction: this.direction,
    };
  }
}
