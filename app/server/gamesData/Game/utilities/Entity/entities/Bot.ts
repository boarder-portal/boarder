import { BOTS_SUPPORTED_GAMES } from 'common/constants/game';

import { BotSupportedGameType, GameInfo, GameType } from 'common/types/game';

import Entity, { EntityConstructor, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Client from 'server/gamesData/Game/utilities/Entity/components/Client';
import GameInfoComponent from 'server/gamesData/Game/utilities/Entity/components/GameInfo';

import HeartsBot from 'server/gamesData/Game/HeartsGame/HeartsBot';
import MahjongBot from 'server/gamesData/Game/MahjongGame/MahjongBot';
import OnitamaBot from 'server/gamesData/Game/OnitamaGame/OnitamaBot';
import SevenWondersBot from 'server/gamesData/Game/SevenWondersGame/SevenWondersBot';

export interface BotOptions<Game extends BotSupportedGameType> {
  game: Game;
  playerIndex: number;
}

const BOTS_MAP: { [Game in (typeof BOTS_SUPPORTED_GAMES)[number]]: EntityConstructor } = {
  [GameType.ONITAMA]: OnitamaBot,
  [GameType.SEVEN_WONDERS]: SevenWondersBot,
  [GameType.HEARTS]: HeartsBot,
  [GameType.MAHJONG]: MahjongBot,
};

export default class Bot<Game extends BotSupportedGameType> extends Entity {
  readonly client: Client<Game, this>;
  readonly #gameInfoComponent = this.obtainComponent(GameInfoComponent<Game, this>);

  readonly #game: Game;
  readonly playerIndex: number;
  #gameInfo: GameInfo<Game> | null = null;

  constructor(options: BotOptions<Game>) {
    super();

    this.#game = options.game;
    this.playerIndex = options.playerIndex;
    this.client = this.addComponent(Client<Game, this>, {
      getSocketAddress: () => `${this.#gameInfoComponent.serverAddress}?botIndex=${this.playerIndex}&settings={}`,
    });
  }

  *lifecycle(): EntityGenerator {
    ({ info: this.#gameInfo } = yield* this.client.waitForGameData());

    const BotConstructor: EntityConstructor = BOTS_MAP[this.#game];

    yield* this.waitForEntity(this.spawnEntity(BotConstructor));
  }

  getGameInfo(): GameInfo<Game> {
    if (!this.#gameInfo) {
      throw new Error('No game info');
    }

    return this.#gameInfo;
  }

  getPlayer(): GameInfo<Game>['players'][number] {
    return this.getGameInfo().players[this.playerIndex];
  }

  *refreshGameInfo(): EntityGenerator<GameInfo<Game>> {
    return (this.#gameInfo = yield* this.client.waitForGameInfo());
  }
}
