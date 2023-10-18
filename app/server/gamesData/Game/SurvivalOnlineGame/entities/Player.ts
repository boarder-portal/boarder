import { GameType } from 'common/types/game';
import {
  Direction,
  GameClientEventType,
  ObjectType,
  PlayerData,
  PlayerObject,
} from 'common/types/games/survivalOnline';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import PlayerComponent from 'server/gamesData/Game/utilities/Entity/components/Player';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';

import SurvivalOnlineGame, {
  ServerCell,
  ServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface PlayerOptions {
  cell: ServerCell;
  index: number;
}

export default class Player extends Entity {
  game = this.getClosestEntity(SurvivalOnlineGame);

  server = this.obtainComponent(Server<GameType.SURVIVAL_ONLINE, this>);

  cell: ServerCellWithEntity<Player>;
  index: number;
  direction = Direction.DOWN;

  constructor(options: PlayerOptions) {
    super();

    this.cell = options.cell as ServerCellWithEntity<Player>;
    this.index = options.index;

    this.addComponent(PlayerComponent, {
      index: this.index,
    });
  }

  *lifecycle(): EntityGenerator {
    this.spawnTask(this.listenForEvents());

    yield* this.eternity();
  }

  *listenForEvents(): EntityGenerator {
    yield* this.all([
      this.server.listenForOwnSocketEvent(GameClientEventType.MOVE_PLAYER, (direction) => {
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
