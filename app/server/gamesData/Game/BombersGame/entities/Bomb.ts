import { EGame } from 'common/types/game';
import { EObject, IBomb } from 'common/types/bombers';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import BombersGame from 'server/gamesData/Game/BombersGame/BombersGame';

export interface IBombOptions {
  range: number;
  explodesAt: number;
}

export default class Bomb extends ServerEntity<EGame.BOMBERS> {
  range: number;
  explodesAt: number;

  explodeTrigger = this.createTrigger();

  constructor(game: BombersGame, options: IBombOptions) {
    super(game);

    this.range = options.range;
    this.explodesAt = options.explodesAt;
  }

  *lifecycle(): TGenerator {
    yield* this.explodeTrigger;
  }

  explode(): void {
    this.explodeTrigger();
  }

  toJSON(): IBomb {
    return {
      type: EObject.BOMB,
      explodesAt: this.explodesAt,
    };
  }
}
