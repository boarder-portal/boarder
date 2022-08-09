import { EGame, TGameInfo, TGameResult, TPlayerSettings } from 'common/types/game';
import { ECommonGameClientEvent, ECommonGameServerEvent, TChangeSettingEvent } from 'common/types';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import { IBotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import AbortError from 'server/gamesData/Game/utilities/AbortError';
import { now } from 'server/utilities/time';
import { areBotsAvailable } from 'common/utilities/bots';

import { BOTS } from 'server/gamesData/Game/Game';

export type TSettingsChangeEvent<Game extends EGame> = {
  playerIndex: number;
  settings: TPlayerSettings<Game>;
} & TChangeSettingEvent<Game>;

export default abstract class GameEntity<Game extends EGame> extends ServerEntity<Game, TGameResult<Game>> {
  spawned = true;

  abstract toJSON(): TGameInfo<Game>;

  *beforeLifecycle(): TGenerator {
    yield* super.beforeLifecycle();

    this.spawnTask(this.spawnBots());
    this.spawnTask(this.watchSettingChange());
  }

  getGameInfo(): TGameInfo<Game> {
    return this.toJSON();
  }

  getSettingChangeEvent(playerIndex: number, event: TChangeSettingEvent<Game>): TSettingsChangeEvent<Game> {
    return {
      playerIndex,
      settings: this.getPlayers()[playerIndex].settings,
      ...event,
    };
  }

  isPauseSupported(): boolean {
    return false;
  }

  *listenForSettingsChange(callback: (event: TSettingsChangeEvent<Game>) => unknown): TGenerator {
    yield* this.listenForEvent(ECommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      callback(this.getSettingChangeEvent(playerIndex, data as any));
    });
  }

  ping(): void {
    this.sendSocketEvent(ECommonGameServerEvent.PING, now());
  }

  *pingIndefinitely(interval: number): TGenerator {
    yield* this.repeatTask(interval, function* () {
      this.ping();
    });
  }

  sendGameInfo(): void {
    this.sendSocketEvent(ECommonGameServerEvent.GET_INFO, this.getGameInfo(), {
      batch: true,
    });
  }

  *spawnBot(Bot: IBotConstructor<Game>, playerIndex: number): TGenerator {
    try {
      yield* this.spawnEntity(new Bot(this, { playerIndex }));
    } catch (err) {
      if (!(err instanceof AbortError)) {
        console.log(`Bot #${playerIndex} error`, err);
      }
    }
  }

  *spawnBots(): TGenerator {
    const bot = areBotsAvailable(this.context.game.game)
      ? (BOTS[this.context.game.game] as IBotConstructor<Game>)
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

  *waitForPlayerSettingChange(playerIndex: number): TGenerator<TSettingsChangeEvent<Game>> {
    const data = yield* this.waitForPlayerSocketEvent(ECommonGameClientEvent.CHANGE_SETTING, {
      playerIndex,
    });

    return this.getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForSettingChange(): TGenerator<TSettingsChangeEvent<Game>> {
    const { data, playerIndex } = yield* this.waitForSocketEvent(ECommonGameClientEvent.CHANGE_SETTING);

    return this.getSettingChangeEvent(playerIndex, data as any);
  }

  *watchSettingChange(): TGenerator {
    yield* this.listenForEvent(ECommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      const player = this.getPlayers()[playerIndex];

      player.settings[data.key as keyof TPlayerSettings<Game>] = data.value as any;

      this.sendGameInfo();
    });
  }
}
