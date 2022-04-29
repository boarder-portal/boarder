import { IPlayer as ICommonPlayer } from 'common/types';
import {
  EGameEvent,
  IPlayer,
} from 'common/types/hearts';
import { EGame } from 'common/types/game';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

class HeartsGame extends Game<EGame.HEARTS> {
  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };

  constructor(options: IGameCreateOptions<EGame.HEARTS>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo(): void {

  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      isActive: false,
      hand: [],
      playedCard: null,
      chosenCardsIndexes: [],
      score: 0,
    };
  }

  onGetGameInfo(): void {

  }
}

export default HeartsGame;
