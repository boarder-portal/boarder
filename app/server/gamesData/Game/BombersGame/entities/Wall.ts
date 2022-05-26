import { EGame } from 'common/types/game';
import { EObject, IWall } from 'common/types/bombers';
import { ICoords } from 'common/types';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IWallOptions {
  coords: ICoords;
}

export default class Wall extends ServerEntity<EGame.BOMBERS> {
  coords: ICoords;

  constructor(game: BombersGame, options: IWallOptions) {
    super(game);

    this.coords = options.coords;
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
