import { IPlayer as ICommonPlayer } from 'common/types';
import { EGameEvent, IPlayer } from 'common/types/hearts';
import { EGame } from 'common/types/game';
import { IGameEvent } from 'server/types';

import Game from 'server/gamesData/Game/Game';
import HeartsGameEntity from 'server/gamesData/Game/HeartsGame/entities/HeartsGame';

export default class HeartsGame extends Game<EGame.HEARTS> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetRootState,
  };
  gameEntity = this.initMainGameEntity(new HeartsGameEntity(this.players));

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      score: 0,
    };
  }

  onGetRootState({ socket }: IGameEvent): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.gameEntity.toJSON(), socket);
  }
}
