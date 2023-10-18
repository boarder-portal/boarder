import { GameType } from 'common/types/game';
import { Round as RoundModel, RoundPlayerData, WindSide } from 'common/types/games/mahjong';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Server from 'server/gamesData/Game/utilities/Entity/components/Server';
import PlayersData from 'server/gamesData/Game/utilities/Entity/utilities/PlayersData';

import Hand from 'server/gamesData/Game/MahjongGame/entities/Hand';

export interface RoundOptions {
  wind: WindSide | null;
  handsCount: number;
  playersWinds: WindSide[];
  isLastInGame: boolean;
}

export default class Round extends Entity {
  gameInfo = this.obtainComponent(GameInfo<GameType.MAHJONG, this>);
  server = this.obtainComponent(Server<GameType.MAHJONG, this>);

  wind: WindSide | null;
  handIndex = -1;
  handsCount: number;
  isLastInGame: boolean;
  playersData: PlayersData<RoundPlayerData>;

  hand: Hand | null = null;

  constructor(options: RoundOptions) {
    super();

    this.wind = options.wind;
    this.handsCount = options.handsCount;
    this.isLastInGame = options.isLastInGame;
    this.playersData = this.gameInfo.createPlayersData({
      init: (playerIndex) => ({
        wind: options.playersWinds[playerIndex],
      }),
    });
  }

  *lifecycle(): EntityGenerator {
    for (let hand = 0; hand < this.handsCount; hand++) {
      const isLastHand = this.isLastInGame && hand === this.handsCount - 1;

      this.handIndex = hand;
      this.hand = this.spawnEntity(Hand, {
        startPlayerIndex: this.playersData.findIndex(({ wind }) => wind === WindSide.EAST),
        isLastInGame: isLastHand,
      });

      this.server.sendGameInfo();

      yield* this.waitForEntity(this.hand);

      this.server.sendGameInfo();
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
