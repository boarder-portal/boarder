import times from 'lodash/times';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EPlayerStatus, IPlayer as ICommonPlayer } from 'common/types';
import {
  ECity,
  EGameEvent,
  IPlayer,
} from 'common/types/sevenWonders';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';
import SevenWondersGameEntity from 'server/gamesData/Game/SevenWondersGame/entities/SevenWondersGame';

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity: SevenWondersGameEntity | null = null;

  constructor(options: IGameCreateOptions<EGame.SEVEN_WONDERS>) {
    super(options);

    this.createGameInfo();
  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      points: 0,
      builtCards: [],
      city: ECity.RHODOS,
      citySide: Number(Math.random() > 0.5),
      builtStages: [],
      coins: 6,
      victoryPoints: [],
      defeatPoints: [],
      isBot: false,
      leadersHand: [],
      copiedCard: null,
    };
  }

  createGameInfo(): void {
    times(this.options.playersCount - this.players.length, (index) => {
      this.players.push({
        ...this.createPlayer({
          status: EPlayerStatus.DISCONNECTED,
          login: `bot-${index}`,
          index: this.players.length,
        }),
        isBot: true,
      });
    });

    this.gameEntity = this.initMainGameEntity(new SevenWondersGameEntity(this.players));
  }

  delete(): void {
    this.gameEntity?.destroy();

    super.delete();
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    if (this.gameEntity) {
      this.sendSocketEvent(EGameEvent.GAME_INFO, this.gameEntity.toJSON(), socket);
    }
  }
}

export default SevenWondersGame;
