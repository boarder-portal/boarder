import { ChangeSettingEvent, CommonGameClientEvent, CommonGameServerEvent } from 'common/types';
import {
  GameEventData,
  GameEventType,
  GameInfo,
  GameResult,
  GameType,
  PlayerSettings,
  TestCaseType,
} from 'common/types/game';

import { areBotsAvailable } from 'common/utilities/bots';
import AbortError from 'server/gamesData/Game/utilities/AbortError';
import { BotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TestCaseConstructor } from 'server/gamesData/Game/utilities/TestCaseEntity';
import { now } from 'server/utilities/time';

import { BOTS, TEST_CASES } from 'server/gamesData/Game/Game';

export type SettingsChangeEvent<Game extends GameType> = {
  playerIndex: number;
  settings: PlayerSettings<Game>;
} & ChangeSettingEvent<Game>;

type GameEventTriggerValue<Game extends GameType> = {
  [GameEvent in GameEventType<Game>]: {
    event: GameEvent;
    data: GameEventData<Game, GameEvent>;
  };
}[GameEventType<Game>];

export default abstract class GameEntity<Game extends GameType> extends ServerEntity<Game, GameResult<Game>> {
  spawned = true;
  eventTrigger = this.createTrigger<GameEventTriggerValue<Game>>();

  abstract toJSON(): GameInfo<Game>;

  *beforeLifecycle(): EntityGenerator {
    yield* super.beforeLifecycle();

    this.spawnTask(this.spawnBots());
    this.spawnTask(this.spawnTestCase());
    this.spawnTask(this.watchSettingChange());
  }

  dispatchGameEvent<GameEvent extends GameEventType<Game>>(
    event: GameEvent,
    data: GameEventData<Game, GameEvent>,
  ): void {
    this.eventTrigger({
      event,
      data,
    });
  }

  getGameInfo(): GameInfo<Game> {
    return this.toJSON();
  }

  getSettingChangeEvent(playerIndex: number, event: ChangeSettingEvent<Game>): SettingsChangeEvent<Game> {
    return {
      playerIndex,
      settings: this.getPlayer(playerIndex).settings,
      ...event,
    };
  }

  isPauseSupported(): boolean {
    return false;
  }

  *listenForSettingsChange(callback: (event: SettingsChangeEvent<Game>) => unknown): EntityGenerator {
    yield* this.listenForEvent(CommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      callback(this.getSettingChangeEvent(playerIndex, data as any));
    });
  }

  ping(): void {
    this.sendSocketEvent(CommonGameServerEvent.PING, now());
  }

  *pingIndefinitely(interval: number): EntityGenerator {
    yield* this.repeatTask(interval, function* () {
      this.ping();
    });
  }

  sendGameInfo(): void {
    this.sendSocketEvent(CommonGameServerEvent.GET_INFO, this.getGameInfo(), {
      batch: true,
    });
  }

  *spawnBot(Bot: BotConstructor<Game>, playerIndex: number): EntityGenerator {
    try {
      yield* this.spawnEntity(new Bot(this, { playerIndex }));
    } catch (err) {
      if (!(err instanceof AbortError)) {
        console.log(`Bot #${playerIndex} error`, err);
      }
    }
  }

  *spawnBots(): EntityGenerator {
    const bot = areBotsAvailable(this.context.game.game)
      ? (BOTS[this.context.game.game] as BotConstructor<Game>)
      : null;

    if (!bot) {
      return;
    }

    yield* this.all(
      this.getPlayers()
        .filter(({ isBot }) => isBot)
        .map(({ index }) => this.spawnBot(bot, index)),
    );
  }

  *spawnTestCase(): EntityGenerator {
    const caseType = this.options.testCaseType;

    if (process.env.NODE_ENV === 'production' || !caseType) {
      return;
    }

    const TestCase = (
      TEST_CASES[this.context.game.game] as Partial<{
        [TestCase in TestCaseType<Game>]: TestCaseConstructor<Game>;
      }>
    )?.[caseType as TestCaseType<Game>];

    if (!TestCase) {
      return;
    }

    try {
      yield* this.spawnEntity(new TestCase(this as any));
    } catch (err) {
      if (!(err instanceof AbortError)) {
        console.log('TestCase error', err);
      }
    }
  }

  *waitForPlayerSettingChange(playerIndex: number): EntityGenerator<SettingsChangeEvent<Game>> {
    const data = yield* this.waitForPlayerSocketEvent(CommonGameClientEvent.CHANGE_SETTING, {
      playerIndex,
    });

    return this.getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForSettingChange(): EntityGenerator<SettingsChangeEvent<Game>> {
    const { data, playerIndex } = yield* this.waitForSocketEvent(CommonGameClientEvent.CHANGE_SETTING);

    return this.getSettingChangeEvent(playerIndex, data as any);
  }

  *watchSettingChange(): EntityGenerator {
    yield* this.listenForEvent(CommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      const player = this.getPlayer(playerIndex);

      player.settings[data.key as keyof PlayerSettings<Game>] = data.value as any;

      this.sendGameInfo();
    });
  }
}
