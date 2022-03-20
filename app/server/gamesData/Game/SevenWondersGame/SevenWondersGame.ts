import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { IGameEvent } from 'server/types';
import { EGame } from 'common/types/game';
import { IPlayer } from 'common/types';
import { ESevenWondersGameEvent, ISevenWondersGameInfoEvent, ISevenWondersPlayer } from 'common/types/sevenWonders';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const {
  games: {
    [EGame.SEVEN_WONDERS]: {
    },
  },
} = GAMES_CONFIG;

class SevenWondersGame extends Game<EGame.SEVEN_WONDERS> {
  handlers = {
    [ESevenWondersGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
  };

  constructor(options: IGameCreateOptions<EGame.SEVEN_WONDERS>) {
    super(options);

    this.createGameInfo();
  }

  createPlayer(roomPlayer: IPlayer): ISevenWondersPlayer {
    return {
      ...roomPlayer,
      hand: [],
      builtCards: [],
    };
  }

  createGameInfo(): void {

  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(ESevenWondersGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  getGameInfoEvent(): ISevenWondersGameInfoEvent {
    return {
      players: this.players,
    };
  }

  deleteGame(): void {
    super.deleteGame();
  }
}

export default SevenWondersGame;
