import { EGame } from 'common/types/game';
import { ICard } from 'common/types/cards';
import { EGameEvent, IPlayer, IRootState, ITurnState } from 'common/types/hearts';

import GameState from 'server/gamesData/Game/utilities/GameState';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import { isDeuceOfClubs } from 'common/utilities/hearts';
import delay from 'common/utilities/delay';
import isDefined from 'common/utilities/isDefined';

export interface ITurnStateResult {
  highestCardPlayerIndex: number;
  takenCards: ICard[];
}

export default class TurnState extends GameState<EGame.HEARTS, IRootState, ITurnStateResult> {
  static createState(players: IPlayer[], startPlayerIndex = 0): ITurnState {
    return {
      startPlayerIndex,
      activePlayerIndex: startPlayerIndex,
      playedCards: players.map(() => null),
    };
  }

  initialState: ITurnState;

  constructor(players: IPlayer[], startPlayerIndex: number) {
    super();

    this.initialState = TurnState.createState(players, startPlayerIndex);
  }

  async lifecycle(): Promise<ITurnStateResult> {
    const rootState = this.getRootState();
    const { players, handState } = rootState;
    const state = handState.turnState = this.initialState;
    const { playedCards } = state;

    this.send(EGameEvent.ROOT_STATE, rootState);

    for (let i = 0; i < players.length; i++) {
      const { activePlayerIndex } = state;
      const activePlayer = players[activePlayerIndex];
      const activePlayerHand = handState.hands[activePlayerIndex];

      const chooseCard = (cardIndex: number): void => {
        playedCards[activePlayerIndex] = activePlayerHand.splice(cardIndex, 1)[0] ?? null;
      };

      const deuceOfClubsIndex = activePlayerHand.findIndex(isDeuceOfClubs);

      if (deuceOfClubsIndex === -1) {
        const { cardIndex } = await this.waitFor(EGameEvent.CHOOSE_CARD, activePlayer.login);

        chooseCard(cardIndex);
      } else {
        chooseCard(deuceOfClubsIndex);
      }

      state.activePlayerIndex = i === players.length - 1
        ? -1
        : (activePlayerIndex + 1) % players.length;

      this.send(EGameEvent.ROOT_STATE, rootState);
    }

    if (!playedCards.every(isDefined)) {
      throw new Error('Missing cards');
    }

    await delay(2000);

    return {
      highestCardPlayerIndex: getHighestCardIndex(playedCards, state.startPlayerIndex),
      takenCards: playedCards,
    };
  }
}
