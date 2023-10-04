import { GameEventData, GameEventType, GameType } from 'common/types/game';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import { GameEntity } from 'server/gamesData/Game/Game';

export interface TestCaseConstructor<Game extends GameType> {
  new (game: GameEntity<Game>): TestCaseEntity<Game>;
}

export default abstract class TestCaseEntity<Game extends GameType> extends ServerEntity<Game> {
  game: GameEntity<Game>;

  constructor(game: GameEntity<Game>) {
    super(game as any);

    this.game = game;
  }

  *waitForGameEvent<GameEvent extends GameEventType<Game>>(
    event: GameEvent,
  ): EntityGenerator<GameEventData<Game, GameEvent>> {
    while (true) {
      const { event: triggeredEvent, data } = yield* this.waitForTrigger(this.game.eventTrigger);

      if (triggeredEvent === event) {
        return data as GameEventData<Game, GameEvent>;
      }
    }
  }
}
