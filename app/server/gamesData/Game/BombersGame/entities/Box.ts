import { EGame } from 'common/types/game';
import { ICoords } from 'common/types';
import { EObject, IBox } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBoxOptions {
  coords: ICoords;
}

export default class Box extends ServerEntity<EGame.BOMBERS> {
  coords: ICoords;

  constructor(game: BombersGame, options: IBoxOptions) {
    super(game);

    this.coords = options.coords;
  }

  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  toJSON(): IBox {
    return {
      type: EObject.BOX,
    };
  }
}
