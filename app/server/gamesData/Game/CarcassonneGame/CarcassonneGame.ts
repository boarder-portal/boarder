import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { ECityGoods, EGameEvent, EMeepleType, EPlayerColor, IPlayer } from 'common/types/carcassonne';
import { IGamePlayer as ICommonPlayer } from 'common/types';

import Game from 'server/gamesData/Game/Game';
import CarcassonneGameEntity from 'server/gamesData/Game/CarcassonneGame/entities/CarcassonneGame';

// console.log(cards.filter((card) => !isValidCard(card)).map(({ id }) => id));

class CarcassonneGame extends Game<EGame.CARCASSONNE> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };
  gameEntity = this.initMainGameEntity((context) => new CarcassonneGameEntity(context));

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      color: EPlayerColor.RED,
      score: [],
      cards: [],
      meeples: {
        [EMeepleType.COMMON]: 7,
        [EMeepleType.FAT]: 1,
        [EMeepleType.BUILDER]: 1,
        [EMeepleType.PIG]: 1,
      },
      goods: {
        [ECityGoods.WHEAT]: 0,
        [ECityGoods.FABRIC]: 0,
        [ECityGoods.WINE]: 0,
      },
      lastMoves: [],
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

export default CarcassonneGame;
