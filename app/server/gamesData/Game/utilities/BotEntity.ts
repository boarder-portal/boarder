import { GameInfo, GameType } from 'common/types/game';

import { EntityGenerator } from 'common/utilities/Entity/Entity';
import ClientEntity from 'server/gamesData/Game/utilities/ClientEntity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

export interface BotOptions {
  playerIndex: number;
}

export interface BotConstructor<Game extends GameType> {
  new (game: GameEntity<Game>, options: BotOptions): BotEntity<Game>;
}

export default abstract class BotEntity<Game extends GameType> extends ClientEntity<Game> {
  playerIndex: number;
  gameInfo: GameInfo<Game> | null = null;

  constructor(game: GameEntity<Game>, options: BotOptions) {
    super(game);

    this.playerIndex = options.playerIndex;
  }

  *beforeLifecycle(): EntityGenerator {
    yield* super.beforeLifecycle();

    ({ info: this.gameInfo } = yield* this.waitForGameData());
  }

  getGameInfo(): GameInfo<Game> {
    if (!this.gameInfo) {
      throw new Error('No game info');
    }

    return this.gameInfo;
  }

  getSocketAddress(): string {
    return `${super.getSocketAddress()}?botIndex=${this.playerIndex}&settings={}`;
  }

  *refreshGameInfo(): EntityGenerator<GameInfo<Game>> {
    return (this.gameInfo = yield* this.waitForGameInfo());
  }
}
