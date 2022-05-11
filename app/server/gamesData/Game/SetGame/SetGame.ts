import { IPlayer as ICommonPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGameEvent, IPlayer } from 'common/types/set';
import { EGame } from 'common/types/game';

import SetGameEntity from 'server/gamesData/Game/SetGame/entities/SetGame';
import Game from 'server/gamesData/Game/Game';

export default class SetGame extends Game<EGame.SET> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity(new SetGameEntity(this.players));

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      score: 0,
    };
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(EGameEvent.GAME_INFO, this.gameEntity.toJSON());
  }
}
