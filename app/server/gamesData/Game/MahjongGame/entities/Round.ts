import { GameType } from 'common/types/game';
import { Round as RoundModel, RoundPlayerData, WindSide } from 'common/types/games/mahjong';

import { EntityGenerator } from 'server/gamesData/Game/utilities/Entity';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

import MahjongGame from 'server/gamesData/Game/MahjongGame/MahjongGame';
import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';

export interface RoundOptions {
  wind: WindSide | null;
  handsCount: number;
  playersWinds: WindSide[];
  isLastInGame: boolean;
}

export default class Round extends ServerEntity<GameType.MAHJONG> {
  game: MahjongGame;

  wind: WindSide | null;
  handIndex = -1;
  handsCount: number;
  isLastInGame: boolean;
  playersData: RoundPlayerData[];

  hand: Hand | null = null;

  constructor(game: MahjongGame, options: RoundOptions) {
    super(game);

    this.game = game;
    this.wind = options.wind;
    this.handsCount = options.handsCount;
    this.isLastInGame = options.isLastInGame;
    this.playersData = this.getPlayersData((playerIndex) => ({
      wind: options.playersWinds[playerIndex],
    }));
  }

  *lifecycle(): EntityGenerator {
    for (let hand = 0; hand < this.handsCount; hand++) {
      const isLastHand = this.isLastInGame && hand === this.handsCount - 1;

      this.handIndex = hand;
      this.hand = this.spawnEntity(
        new Hand(this, {
          startPlayerIndex: this.playersData.findIndex(({ wind }) => wind === WindSide.EAST),
          isLastInGame: isLastHand,
        }),
      );

      this.game.sendGameInfo();

      yield* this.hand;

      this.game.sendGameInfo();
    }
  }

  toJSON(): RoundModel {
    return {
      wind: this.wind,
      handIndex: this.handIndex,
      hand: this.hand?.toJSON() ?? null,
    };
  }
}
