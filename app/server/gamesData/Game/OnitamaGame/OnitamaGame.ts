import { EGameEvent, EPlayerColor, IPlayer } from 'common/types/onitama';
import { IGamePlayer as ICommonPlayer } from 'common/types';
import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';

import Game from 'server/gamesData/Game/Game';
import OnitamaGameEntity from 'server/gamesData/Game/OnitamaGame/entities/OnitamaGame';

class OnitamaGame extends Game<EGame.ONITAMA> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity(new OnitamaGameEntity(this.players));

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      cards: [],
      color: EPlayerColor.BLUE,
    };
  }

  delete(): void {
    super.delete();

    this.gameEntity.destroy();
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    this.sendSocketEvent(EGameEvent.GAME_INFO, this.gameEntity.toJSON(), socket);
  }
}

export default OnitamaGame;
