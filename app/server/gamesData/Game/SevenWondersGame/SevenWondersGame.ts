import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { IGamePlayer as ICommonPlayer } from 'common/types';
import { EGameEvent } from 'common/types/sevenWonders';

import Game from 'server/gamesData/Game/Game';
import SevenWondersGameEntity from 'server/gamesData/Game/SevenWondersGame/entities/SevenWondersGame';

export default class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity((context) => new SevenWondersGameEntity(context));

  createPlayer(roomPlayer: ICommonPlayer): ICommonPlayer {
    return roomPlayer;
  }

  delete(): void {
    super.delete();

    this.gameEntity.destroy();
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.gameEntity.toJSON(), socket);
  }
}
