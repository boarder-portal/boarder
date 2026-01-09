import { GameEventData, GameEventType, GameType, TestCaseType } from 'common/types/game';

import { EntityConstructor, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import Events from 'server/gamesData/Game/utilities/Entity/components/Events';
import GameInfoComponent from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import GameRoot from 'server/gamesData/Game/utilities/Entity/entities/GameRoot';

import bombersTestCases from 'server/gamesData/Game/BombersGame/testCases';
import carcassonneTestCases from 'server/gamesData/Game/CarcassonneGame/testCases';
import mahjongTestCases from 'server/gamesData/Game/MahjongGame/testCases';

type GameEventValue<Game extends GameType> = {
  [GameEvent in GameEventType<Game>]: {
    event: GameEvent;
    data: GameEventData<Game, GameEvent>;
  };
}[GameEventType<Game>];

export const TEST_CASES: Partial<{
  [Game in GameType]: Partial<{ [TestCase in TestCaseType<Game>]: EntityConstructor }>;
}> = {
  [GameType.CARCASSONNE]: carcassonneTestCases,
  [GameType.BOMBERS]: bombersTestCases,
  [GameType.MAHJONG]: mahjongTestCases,
};

export default class TestCase<
  Game extends GameType,
  E extends GameRoot<Game> = GameRoot<Game>,
> extends EntityComponent<E> {
  private _gameInfo = this.entity.obtainComponent(GameInfoComponent<Game, E>);
  private _events = this.entity.obtainComponent(Events);

  private _gameEvent = this._events.createEvent<GameEventValue<Game>>();

  onInit(): void {
    super.onInit();

    if (!(this.entity instanceof GameRoot)) {
      throw new Error('Can only attach TestCase to GameRoot');
    }

    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const game: Game = this._gameInfo.game.game;
    const caseType: TestCaseType<Game> | undefined = this._gameInfo.options.testCaseType;

    if (!caseType) {
      return;
    }

    const TestCaseConstructor: EntityConstructor | undefined = TEST_CASES[game]?.[caseType];

    if (!TestCaseConstructor) {
      return;
    }

    this.entity.spawnEntity(TestCaseConstructor);
  }

  dispatchGameEvent<GameEvent extends GameEventType<Game>>(
    event: GameEvent,
    data: GameEventData<Game, GameEvent>,
  ): void {
    this._gameEvent.dispatch({
      event,
      data,
    });
  }

  *waitForGameEvent<GameEvent extends GameEventType<Game>>(
    event: GameEvent,
  ): EntityGenerator<GameEventData<Game, GameEvent>> {
    while (true) {
      const { event: triggeredEvent, data } = yield* this._events.waitForEvent(this._gameEvent);

      if (triggeredEvent === event) {
        return data as GameEventData<Game, GameEvent>;
      }
    }
  }
}
