import { EGame, TGameInfo } from 'common/types/game';

import ClientEntity from 'server/gamesData/Game/utilities/ClientEntity';
import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { TGenerator } from 'server/gamesData/Game/utilities/Entity';

export interface IBotOptions {
  playerIndex: number;
}

export interface IBotConstructor<Game extends EGame> {
  new (game: GameEntity<Game>, options: IBotOptions): BotEntity<Game>;
}

export default abstract class BotEntity<Game extends EGame> extends ClientEntity<Game> {
  playerIndex: number;
  gameInfo: TGameInfo<Game> | null = null;

  constructor(game: GameEntity<Game>, options: IBotOptions) {
    super(game);

    this.playerIndex = options.playerIndex;
  }

  *beforeLifecycle(): TGenerator {
    yield* super.beforeLifecycle();

    ({ info: this.gameInfo } = yield* this.waitForGameData());
  }

  getGameInfo(): TGameInfo<Game> {
    if (!this.gameInfo) {
      throw new Error('No game info');
    }

    return this.gameInfo;
  }

  getSocketAddress(): string {
    return `${super.getSocketAddress()}?botIndex=${this.playerIndex}&settings={}`;
  }

  *refreshGameInfo(): TGenerator<TGameInfo<Game>> {
    return (this.gameInfo = yield* this.waitForGameInfo());
  }
}
