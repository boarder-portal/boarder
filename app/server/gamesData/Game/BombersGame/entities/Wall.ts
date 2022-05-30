import { EGame } from 'common/types/game';
import { EObject, IWall } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

export default class Wall extends ServerEntity<EGame.BOMBERS> {
  *lifecycle(): TGenerator {
    yield* this.eternity();
  }

  toJSON(): IWall {
    return {
      type: EObject.WALL,
    };
  }
}
