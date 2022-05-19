import { IGamePlayer as ICommonPlayer } from 'common/types';
import { EGameEvent } from 'common/types/hearts';
import { EGame } from 'common/types/game';
import { IGameEvent } from 'server/types';

import Game from 'server/gamesData/Game/Game';
import HeartsGameEntity from 'server/gamesData/Game/HeartsGame/entities/HeartsGame';

export default class HeartsGame extends Game<EGame.HEARTS> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity((context) => new HeartsGameEntity(context));

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
