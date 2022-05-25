import { EGame } from 'common/types/game';
import { EObject, IBaseObject } from 'common/types/survivalOnline';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import SurvivalOnlineGame, {
  IServerCell,
  IServerCellWithEntity,
} from 'server/gamesData/Game/SurvivalOnlineGame/SurvivalOnlineGame';

export interface IBaseOptions {
  cell: IServerCell;
}

export default class Base extends ServerEntity<EGame.SURVIVAL_ONLINE> {
  game: SurvivalOnlineGame;

  cell: IServerCellWithEntity<Base>;

  constructor(game: SurvivalOnlineGame, options: IBaseOptions) {
    super(game);

    this.game = game;
    this.cell = options.cell as IServerCellWithEntity<Base>;
  }

  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  toJSON(): IBaseObject {
    return {
      type: EObject.BASE,
    };
  }
}