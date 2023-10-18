import { Move, Turn as TurnModel } from 'common/types/games/redSeven';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';

export default class Turn extends Entity<boolean> {
  playedMoves: Move[] = [];

  *lifecycle(): EntityGenerator<boolean> {
    return true;
  }

  toJSON(): TurnModel {
    return {
      playedMoves: this.playedMoves,
    };
  }
}
