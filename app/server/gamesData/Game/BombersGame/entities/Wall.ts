import { EGame } from 'common/types/game';
import { EObject, IWall } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame, { IServerCell } from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IWallOptions {
  cell: IServerCell;
}

export default class Wall extends ServerEntity<EGame.BOMBERS> {
  cell: IServerCell;

  constructor(game: BombersGame, options: IWallOptions) {
    super(game);

    this.cell = options.cell;
  }

  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  toJSON(): IWall {
    return {
      type: EObject.WALL,
    };
  }
}
