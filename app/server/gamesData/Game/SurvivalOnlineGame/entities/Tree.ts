import { GameType } from 'common/types/game';
import { ObjectType, TreeObject } from 'common/types/games/survivalOnline';

import { EntityGenerator } from 'common/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SurvivalOnlineGame, {
  ServerCell,
  ServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface TreeOptions {
  cell: ServerCell;
}

export default class Tree extends ServerEntity<GameType.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: ServerCellWithEntity<Tree>;

  constructor(game: SurvivalOnlineGame, options: TreeOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as ServerCellWithEntity<Tree>;
  }

  *lifecycle(): EntityGenerator {
    yield* this.eternity();
  }

  toJSON(): TreeObject {
    return {
      type: ObjectType.TREE,
    };
  }
}
