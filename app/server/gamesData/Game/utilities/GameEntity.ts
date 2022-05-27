import { EGame, TGameInfo } from 'common/types/game';
import { ECommonGameServerEvent } from 'common/types';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import { IBotConstructor } from 'server/gamesData/Game/utilities/BotEntity';
import AbortError from 'server/gamesData/Game/utilities/AbortError';

import { BOTS } from 'server/gamesData/Game/Game';

export default abstract class GameEntity<Game extends EGame> extends ServerEntity<Game, void> {
  spawned = true;

  abstract toJSON(): TGameInfo<Game>;

  *beforeLifecycle(): TGenerator {
    yield* super.beforeLifecycle();

    this.spawnTask(this.spawnBots());
  }

  getGameInfo(): TGameInfo<Game> {
    return this.toJSON();
  }

  ping(): void {
    this.sendSocketEvent(ECommonGameServerEvent.PING, Date.now());
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
}
