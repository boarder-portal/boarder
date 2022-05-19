import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { EGameEvent } from 'common/types/carcassonne';
import { IGamePlayer as ICommonPlayer } from 'common/types';

import Game from 'server/gamesData/Game/Game';
import CarcassonneGameEntity from 'server/gamesData/Game/CarcassonneGame/entities/CarcassonneGame';

export default class CarcassonneGame extends Game<EGame.CARCASSONNE> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity((context) => new CarcassonneGameEntity(context));

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
