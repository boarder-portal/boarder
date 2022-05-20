import { IGamePlayer as ICommonPlayer } from 'common/types';
import { EGameEvent } from 'common/types/survivalOnline';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import Game from 'server/gamesData/Game/Game';
import SurvivalOnlineGameEntity from 'server/gamesData/Game/SurvivalOnlineGame/entities/SurvivalOnlineGame';

class SurvivalOnlineGame extends Game<EGame.SURVIVAL_ONLINE> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity((context) => new SurvivalOnlineGameEntity(context));

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

export default SurvivalOnlineGame;
