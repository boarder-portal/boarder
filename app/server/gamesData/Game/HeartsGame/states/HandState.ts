import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import sortBy from 'lodash/sortBy';

import { CARDS_SORT } from 'common/constants/games/common/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';
import { DECKS } from 'server/gamesData/Game/HeartsGame/constants';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IHandState, IPlayer, IRootState } from 'common/types/hearts';
import { ESuit } from 'common/types/cards';

import GameState from 'server/gamesData/Game/utilities/GameState';
import { isDeuceOfClubs, isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import TurnState from 'server/gamesData/Game/HeartsGame/states/TurnState';

const ALL_SCORE = 26;
const SUIT_VALUES: Record<ESuit, number> = {
  [ESuit.CLUBS]: 1e0,
  [ESuit.DIAMONDS]: 1e2,
  [ESuit.SPADES]: 1e4,
  [ESuit.HEARTS]: 1e6,
};

export default class HandState extends GameState<EGame.HEARTS, IRootState, number[]> {
  static createState(players: IPlayer[], stage: EHandStage = EHandStage.PASS): IHandState {
    return {
      stage,
      hands: players.map(() => []),
      chosenCardsIndexes: players.map(() => []),
      takenCards: players.map(() => []),
      heartsEnteredPlay: false,
      turnState: TurnState.createState(players),
    };
  }

  initialState: IHandState;

  constructor(players: IPlayer[], stage: EHandStage) {
    super();

    this.initialState = HandState.createState(players, stage);
  }

  async lifecycle(): Promise<number[]> {
    const rootState = this.getRootState();
    const { players } = rootState;
    const state = rootState.handState = this.initialState;
    const { hands, chosenCardsIndexes, takenCards } = state;

    const deck = shuffle(DECKS[players.length]);
    const shuffledDeck = chunk(deck, deck.length / players.length);

    players.forEach((player, playerIndex) => {
      hands[playerIndex] = shuffledDeck[playerIndex];
    });

    this.sortHands();
    this.send(EGameEvent.ROOT_STATE, rootState);

    if (state.stage === EHandStage.PASS) {
      await this.listen({
        events: {
          [EGameEvent.CHOOSE_CARD]: ({ cardIndex }, player) => {
            const playerChosenCardsIndexes = chosenCardsIndexes[player.index];

            if (playerChosenCardsIndexes.includes(cardIndex)) {
              state.chosenCardsIndexes[player.index] = playerChosenCardsIndexes.filter((index) => index !== cardIndex);
            } else {
              playerChosenCardsIndexes.push(cardIndex);
            }

            this.send(EGameEvent.ROOT_STATE, rootState);
          },
        },
        stopIf: () => (
          state.chosenCardsIndexes.every((indexes) => indexes.length === PASS_CARDS_COUNT)
        ),
      });

      const passedCards = state.chosenCardsIndexes.map((indexes, playerIndex) => (
        indexes.map((cardIndex) => state.hands[playerIndex][cardIndex])
      ));

      players.forEach((player, playerIndex) => {
        hands[this.getTargetPlayerIndex(playerIndex)].push(
          ...passedCards[playerIndex],
        );

        hands[playerIndex] = hands[playerIndex].filter(
          (_card, cardIndex) => !chosenCardsIndexes[playerIndex].includes(cardIndex),
        );
      });

      this.sortHands();

      state.stage = EHandStage.PLAY;

      this.send(EGameEvent.ROOT_STATE, rootState);
    }

    let startPlayerIndex = hands.findIndex((hand) => hand.some(isDeuceOfClubs));

    while (hands.some((hand) => hand.length !== 0)) {
      const {
        highestCardPlayerIndex,
        takenCards: playerTakenCards,
      } = await this.spawnState(new TurnState(players, startPlayerIndex));

      startPlayerIndex = highestCardPlayerIndex;
      state.heartsEnteredPlay ||= playerTakenCards.some(isHeart);

      takenCards[highestCardPlayerIndex].push(...playerTakenCards);
    }

    const playerScores = takenCards.map((takenCards) => (
      takenCards.reduce((score, card) => (
        score + (
          isHeart(card)
            ? 1
            : isQueenOfSpades(card)
              ? 13
              : 0
        )
      ), 0)
    ));
    const takeAllPlayerIndex = playerScores.indexOf(ALL_SCORE);

    return playerScores.map((score, playerIndex) => (
      playerIndex === takeAllPlayerIndex
        ? 0
        : takeAllPlayerIndex === -1
          ? score
          : ALL_SCORE
    ));
  }

  getTargetPlayerIndex(playerIndex: number): number {
    const { players, passDirection } = this.getRootState();

    if (passDirection === EPassDirection.NONE) {
      return playerIndex;
    }

    if (passDirection === EPassDirection.LEFT) {
      return (playerIndex + 1) % players.length;
    }

    if (passDirection === EPassDirection.RIGHT) {
      return (playerIndex - 1 + players.length) % players.length;
    }

    return (playerIndex + 2) % players.length;
  }

  sortHands(): void {
    const { handState } = this.getRootState();

    handState.hands.forEach((hand, playerIndex) => {
      handState.hands[playerIndex] = sortBy(hand, (card) => {
        return SUIT_VALUES[card.suit] + CARDS_SORT.indexOf(card.value);
      });
    });
  }
}
