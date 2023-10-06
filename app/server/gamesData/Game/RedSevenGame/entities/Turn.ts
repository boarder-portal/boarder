import { GameType } from 'common/types/game';
import { Move, Turn as TurnModel } from 'common/types/games/redSeven';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import Hand from 'server/gamesData/Game/RedSevenGame/entities/Hand';

export default class Turn extends ServerEntity<GameType.RED_SEVEN, boolean> {
  hand: Hand;

  playedMoves: Move[] = [];

  constructor(hand: Hand) {
    super(hand);

    this.hand = hand;
  }

  *lifecycle(): EntityGenerator<boolean> {
    return true;
  }

  toJSON(): TurnModel {
    return {
      playedMoves: this.playedMoves,
    };
  }
}
