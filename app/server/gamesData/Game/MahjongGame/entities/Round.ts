import { EGame } from 'common/types/game';
import { EWind, IRound, IRoundPlayerData } from 'common/types/mahjong';

import { TGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';

export interface IRoundOptions {
  wind: EWind | null;
  handsCount: number;
  playersWinds: EWind[];
  isLastInGame: boolean;
}

export default class Round extends ServerEntity<EGame.MAHJONG> {
  game: MahjongGame;

  wind: EWind | null;
  handsCount: number;
  isLastInGame: boolean;
  playersData: IRoundPlayerData[];

  hand: Hand | null = null;

  constructor(game: MahjongGame, options: IRoundOptions) {
    super(game);

    this.game = game;
    this.wind = options.wind;
    this.handsCount = options.handsCount;
    this.isLastInGame = options.isLastInGame;
    this.playersData = this.getPlayersData((playerIndex) => ({
      wind: options.playersWinds[playerIndex],
    }));
  }

  *lifecycle(): TGenerator {
    for (let hand = 0; hand < this.handsCount; hand++) {
      this.hand = this.spawnEntity(
        new Hand(this, {
          startPlayerIndex: this.playersData.findIndex(({ wind }) => wind === EWind.EAST),
          isLastInGame: this.isLastInGame && hand === this.handsCount - 1,
        }),
      );

      const result = yield* this.hand;

      this.game.addHandResult(result);
    }
  }

  toJSON(): IRound {
    return {
      wind: this.wind,
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
