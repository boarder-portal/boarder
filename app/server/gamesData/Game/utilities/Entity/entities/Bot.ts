import { BOTS_SUPPORTED_GAMES } from 'common/constants/game';

import { BotSupportedGameType, GameInfo, GameType } from 'common/types/game';

import Entity, { EntityConstructor, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import Client from 'server/gamesData/Game/utilities/Entity/components/Client';
import GameInfoComponent from 'server/gamesData/Game/utilities/Entity/components/GameInfo';

import HeartsBot from 'server/gamesData/Game/HeartsGame/HeartsBot';
import MahjongBot from 'server/gamesData/Game/MahjongGame/MahjongBot';
import OnitamaBot from 'server/gamesData/Game/OnitamaGame/OnitamaBot';
import OuterMindsBot from 'server/gamesData/Game/OuterMindsGame/OuterMindsBot';
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
  [GameType.OUTER_MINDS]: OuterMindsBot,
};

export default class Bot<Game extends BotSupportedGameType> extends Entity {
  private readonly _gameInfoComponent = this.obtainComponent(GameInfoComponent<Game, this>);

  private readonly _game: Game;
  private _gameInfo: GameInfo<Game> | null = null;

  readonly client: Client<Game, this>;
  readonly playerIndex: number;

  constructor(options: BotOptions<Game>) {
    super();

    this._game = options.game;
    this.playerIndex = options.playerIndex;
    this.client = this.addComponent(Client<Game, this>, {
      getSocketAddress: () => `${this._gameInfoComponent.serverAddress}?botIndex=${this.playerIndex}&settings={}`,
    });
  }

  *lifecycle(): EntityGenerator {
    const { infoString } = yield* this.client.waitForGameData();

    this._gameInfo = JSON.parse(infoString);

    const BotConstructor: EntityConstructor = BOTS_MAP[this._game];

    yield* this.waitForEntity(this.spawnEntity(BotConstructor));
  }

  getGameInfo(): GameInfo<Game> {
    if (!this._gameInfo) {
      throw new Error('No game info');
    }

    return this._gameInfo;
  }

  getPlayer(): GameInfo<Game>['players'][number] {
    return this.getGameInfo().players[this.playerIndex];
  }

  *refreshGameInfo(): EntityGenerator<GameInfo<Game>> {
    return (this._gameInfo = yield* this.client.waitForGameInfo());
  }
}
