import { EGame } from 'common/types/game';
import { ICoords } from 'common/types';
import { EObject, IBox } from 'common/types/bombers';

import Entity, { TGenerator } from 'server/gamesData/Game/utilities/Entity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBoxOptions {
  coords: ICoords;
}

export default class Box extends Entity<EGame.BOMBERS> {
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
