import { EGame } from 'common/types/game';
import { EGameEvent, IGameOptions, IPlayer, ITurn } from 'common/types/pexeso';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';

import PexesoGame from 'server/gamesData/Game/PexesoGame/entities/PexesoGame';

export interface ITurnOptions {
  activePlayer: IPlayer;
}

export default class Turn extends GameEntity<EGame.PEXESO, number[]> {
  game: PexesoGame;
  options: IGameOptions;
  activePlayer: IPlayer;

  openedCardsIndexes: number[] = [];

  constructor(game: PexesoGame, options: ITurnOptions) {
    super();

    this.game = game;
    this.options = game.options;
    this.activePlayer = options.activePlayer;
  }

  async lifecycle() {
    while (this.openedCardsIndexes.length < this.options.matchingCardsCount) {
      const cardIndex = await this.waitForSocketEvent(EGameEvent.OPEN_CARD, {
        player: this.activePlayer.login,
        validate: this.validateOpenCardEvent,
      });

      this.openedCardsIndexes.push(cardIndex);

      this.sendSocketEvent(EGameEvent.OPEN_CARD, cardIndex);
    }

    return this.openedCardsIndexes;
  }

  toJSON(): ITurn {
    return {
      openedCardsIndexes: this.openedCardsIndexes,
    };
  }

  validateOpenCardEvent = (cardIndex: unknown): asserts cardIndex is number => {
    if (typeof cardIndex !== 'number') {
      throw new Error('Invalid number');
    }

    if (!this.game.isCardInGame(cardIndex)) {
      throw new Error('Card is not in game');
    }

    if (this.openedCardsIndexes.includes(cardIndex)) {
      throw new Error('Already opened');
    }
  };
}
