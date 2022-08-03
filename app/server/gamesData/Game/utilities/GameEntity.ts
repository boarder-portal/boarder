import { EGame, TGameInfo, TGameResult, TPlayerSettings } from 'common/types/game';
import { ECommonGameClientEvent, ECommonGameServerEvent } from 'common/types';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import { IBotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import AbortError from 'server/gamesData/Game/utilities/AbortError';
import { now } from 'server/utilities/time';

import { BOTS } from 'server/gamesData/Game/Game';

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

  *listenForSettingsChange(callback: (settings: TPlayerSettings<Game>) => unknown): TGenerator {
    yield* this.listenForEvent(ECommonGameClientEvent.CHANGE_SETTING, ({ playerIndex }) => {
      callback(this.getPlayers()[playerIndex].settings);
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
    const bot = BOTS[this.context.game.game];

    if (!bot) {
      return;
    }

    yield* this.all(
      this.getPlayers()
        .filter(({ isBot }) => isBot)
        .map(({ index }) => this.spawnBot(bot, index)),
    );
  }

  *watchSettingChange(): TGenerator {
    yield* this.listenForEvent(ECommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) => {
      const player = this.getPlayers()[playerIndex];

      player.settings[data.key as keyof TPlayerSettings<Game>] = data.value as any;

      this.context.game.sendUpdatePlayersEvent();
    });
  }
}
