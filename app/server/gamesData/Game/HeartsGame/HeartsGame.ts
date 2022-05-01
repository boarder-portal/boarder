import { IPlayer as ICommonPlayer } from 'common/types';
import { EGameEvent, IPlayer, IRootState } from 'common/types/hearts';
import { EGame } from 'common/types/game';
import { IGameEvent } from 'server/types';

import Game from 'server/gamesData/Game/Game';
import RootState from 'server/gamesData/Game/HeartsGame/states/RootState';

export default class HeartsGame extends Game<EGame.HEARTS, IRootState> {
  handlers = {
    [EGameEvent.GET_ROOT_STATE]: this.onGetRootState,
  };
  rootState = this.initMainGameState(new RootState(this.players));

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      score: 0,
    };
  }

  onGetRootState({ socket }: IGameEvent): void {
    this.send(EGameEvent.ROOT_STATE, this.rootState, socket);
  }
}
