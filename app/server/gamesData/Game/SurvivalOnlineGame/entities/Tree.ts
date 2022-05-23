import { EGame } from 'common/types/game';
import { EObject, ITreeObject } from 'common/types/survivalOnline';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface ITreeOptions {
  cell: IServerCell;
}

export default class Tree extends Entity<EGame.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: IServerCellWithEntity<Tree>;

  constructor(game: SurvivalOnlineGame, options: ITreeOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as IServerCellWithEntity<Tree>;
  }

  *lifecycle(): TGenerator {
    this.game.placeEntity(this, this.cell);

    yield* this.eternity();
  }

  toJSON(): ITreeObject {
    return {
      type: EObject.TREE,
    };
  }
}
