import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import sortBy from 'lodash/sortBy';

import { CARDS_SORT } from 'common/constants/games/common/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';
import { DECKS } from 'server/gamesData/Game/HeartsGame/constants';

import { EGame } from 'common/types/game';
import { EGameEvent, EHandStage, EPassDirection, IHand, IHandPlayerData, IPlayer } from 'common/types/hearts';
import { ESuit, ICard } from 'common/types/cards';

import GameEntity from 'server/gamesData/Game/utilities/GameEntity';
import { isDeuceOfClubs, isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import Root from 'server/gamesData/Game/HeartsGame/entities/Root';
import Turn from 'server/gamesData/Game/HeartsGame/entities/Turn';

const ALL_SCORE = 26;
const SUIT_VALUES: Record<ESuit, number> = {
  [ESuit.CLUBS]: 1e0,
  [ESuit.DIAMONDS]: 1e2,
  [ESuit.SPADES]: 1e4,
  [ESuit.HEARTS]: 1e6,
};

export default class Hand extends GameEntity<EGame.HEARTS, number[]> {
  root: Root;
  players: IPlayer[];
  stage: EHandStage;
  playersData: IHandPlayerData[];
  heartsEnteredPlay = false;
  turn: Turn | null = null;

  constructor(root: Root, stage: EHandStage) {
    super();

    this.root = root;
    this.players = root.players;
    this.stage = stage;
    this.playersData = root.players.map(() => ({
      hand: [],
      chosenCardsIndexes: [],
      takenCards: [],
    }));
  }

  *lifecycle() {
    const deck = shuffle(DECKS[this.players.length]);
    const shuffledDeck = chunk(deck, deck.length / this.players.length);

    this.players.forEach((player, playerIndex) => {
      this.playersData[playerIndex].hand = shuffledDeck[playerIndex];
    });

    this.sortHands();
    this.root.sendInfo();

    if (this.stage === EHandStage.PASS) {
      yield* this.listenSocketWhile(
        () => this.playersData.every(({ chosenCardsIndexes }) => chosenCardsIndexes.length === PASS_CARDS_COUNT),
        {
          [EGameEvent.CHOOSE_CARD]: ({ cardIndex }, player) => {
            const playerChosenCardsIndexes = this.playersData[player.index].chosenCardsIndexes;

            if (playerChosenCardsIndexes.includes(cardIndex)) {
              this.playersData[player.index].chosenCardsIndexes = playerChosenCardsIndexes.filter((index) => index !== cardIndex);
            } else {
              playerChosenCardsIndexes.push(cardIndex);
            }

            this.root.sendInfo();
          },
        },
      );

      const passedCards = this.playersData.map(({ chosenCardsIndexes, hand }) => (
        chosenCardsIndexes.map((cardIndex) => hand[cardIndex])
      ));

      this.playersData.forEach((playerData, playerIndex) => {
        this.playersData[this.getTargetPlayerIndex(playerIndex)].hand.push(
          ...passedCards[playerIndex],
        );

        playerData.hand = playerData.hand.filter(
          (_card, cardIndex) => !playerData.chosenCardsIndexes.includes(cardIndex),
        );
      });

      this.sortHands();

      this.stage = EHandStage.PLAY;

      this.root.sendInfo();
    }

    let startPlayerIndex = this.playersData.findIndex(({ hand }) => hand.some(isDeuceOfClubs));

    while (this.playersData.some(({ hand }) => hand.length !== 0)) {
      this.turn = this.spawnEntity(
        new Turn(this, startPlayerIndex),
      );

      this.root.sendInfo();

      const {
        highestCardPlayerIndex,
        takenCards: playerTakenCards,
      } = yield* this.awaitEntity(this.turn);

      startPlayerIndex = highestCardPlayerIndex;
      this.heartsEnteredPlay ||= playerTakenCards.some(isHeart);

      this.playersData[highestCardPlayerIndex].takenCards.push(...playerTakenCards);
    }

    this.turn = null;

    const playerScores = this.playersData.map(({ takenCards }) => (
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

  getDeuceOfClubsIndex(playerIndex: number): number {
    return this.playersData[playerIndex].hand.findIndex(isDeuceOfClubs);
  }

  getTargetPlayerIndex(playerIndex: number): number {
    const { players, passDirection } = this.root;

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
    this.playersData.forEach((playerData) => {
      playerData.hand = sortBy(playerData.hand, (card) => {
        return SUIT_VALUES[card.suit] + CARDS_SORT.indexOf(card.value);
      });
    });
  }

  takePlayerCard(playerIndex: number, cardIndex: number): ICard | null {
    return this.playersData[playerIndex]?.hand.splice(cardIndex, 1)[0] ?? null;
  }

  toJSON(): IHand {
    return {
      stage: this.stage,
      playersData: this.playersData,
      heartsEnteredPlay: this.heartsEnteredPlay,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
