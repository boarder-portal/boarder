import { GameType } from 'common/types/game';
import { BaseObject, ObjectType } from 'common/types/games/survivalOnline';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SurvivalOnlineGame, {
  ServerCell,
  ServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface BaseOptions {
  cell: ServerCell;
}

export default class Base extends ServerEntity<GameType.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: ServerCellWithEntity<Base>;

  constructor(game: SurvivalOnlineGame, options: BaseOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as ServerCellWithEntity<Base>;
  }

  *lifecycle(): EntityGenerator {
    yield* this.eternity();
  }

  toJSON(): BaseObject {
    return {
      type: ObjectType.BASE,
    };
  }
}
