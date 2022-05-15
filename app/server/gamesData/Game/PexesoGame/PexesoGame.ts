import { EGameEvent } from 'common/types/pexeso';
import { IGamePlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import Game from 'server/gamesData/Game/Game';
import PexesoGameEntity from 'server/gamesData/Game/PexesoGame/entities/PexesoGame';

export default class PexesoGame extends Game<EGame.PEXESO> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity(new PexesoGameEntity(this.players, this.options));

  createPlayer(roomPlayer: IGamePlayer): IGamePlayer {
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
