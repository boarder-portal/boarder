import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import sortBy from 'lodash/sortBy';

import { CARDS_SORT, DECK } from 'common/constants/games/common/cards';
import { PASS_CARDS_COUNT } from 'common/constants/games/hearts';

import { IPlayer as ICommonPlayer } from 'common/types';
import { EGameEvent, EHandStage, EPassDirection, IChooseCardEvent, IGameInfoEvent, IPlayer } from 'common/types/hearts';
import { EGame } from 'common/types/game';
import { ESuit, EValue, ICard } from 'common/types/cards';
import { IGameEvent } from 'server/types';

import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';
import getCard from 'common/utilities/cards/getCard';
import isDefined from 'common/utilities/isDefined';
import { getHighestCardIndex } from 'common/utilities/cards/compareCards';
import { isHeart, isQueenOfSpades } from 'common/utilities/hearts';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

const isDeuceOfClubs = isEqualCardsCallback(getCard(EValue.DEUCE, ESuit.CLUBS));

const ALL_SCORE = 26;
const SUIT_VALUES: Record<ESuit, number> = {
  [ESuit.CLUBS]: 1e0,
  [ESuit.DIAMONDS]: 1e2,
  [ESuit.SPADES]: 1e4,
  [ESuit.HEARTS]: 1e6,
};

class HeartsGame extends Game<EGame.HEARTS> {
  static decks: Record<number, ICard[]> = {
    2: DECK,
    4: DECK,
  };
  static passDirections: Record<number, EPassDirection[]> = {
    2: [EPassDirection.LEFT, EPassDirection.NONE],
    3: [EPassDirection.LEFT, EPassDirection.RIGHT, EPassDirection.NONE],
    4: [EPassDirection.LEFT, EPassDirection.RIGHT, EPassDirection.ACROSS, EPassDirection.NONE],
  };

  static initDecks(): void {
    this.decks[3] = [...DECK];

    const removedCardIndex = this.decks[3].findIndex(
      isEqualCardsCallback(getCard(EValue.DEUCE, ESuit.DIAMONDS)),
    );

    if (removedCardIndex !== -1) {
      this.decks[3].splice(removedCardIndex, 1);
    }
  }

  handlers = {
    [EGameEvent.GET_GAME_INFO]: this.onGetGameInfo,
    [EGameEvent.CHOOSE_CARD]: this.onChooseCard,
  };
  handIndex = -1;
  stage: EHandStage = EHandStage.PASS;
  passDirection: EPassDirection = EPassDirection.LEFT;
  startTurnPlayerIndex = 0;
  heartsEnteredPlay = false;
  isFirstTurn = false;

  constructor(options: IGameCreateOptions<EGame.HEARTS>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo(): void {
    this.startHand();
  }

  createPlayer(roomPlayer: ICommonPlayer): IPlayer {
    return {
      ...roomPlayer,
      isActive: false,
      hand: [],
      playedCard: null,
      chosenCardsIndexes: [],
      score: 0,
      takenCards: [],
    };
  }

  startHand(): void {
    const deck = shuffle(HeartsGame.decks[this.players.length]);
    const shuffledDeck = chunk(deck, deck.length / this.players.length);

    this.handIndex++;
    this.passDirection = HeartsGame.passDirections[this.players.length][this.handIndex % this.players.length];
    this.stage = this.passDirection === EPassDirection.NONE
      ? EHandStage.PLAY
      : EHandStage.PASS;
    this.heartsEnteredPlay = false;
    this.isFirstTurn = true;

    this.players.forEach((player, index) => {
      player.hand = shuffledDeck[index];
      player.isActive = false;
    });

    if (this.stage === EHandStage.PLAY) {
      this.startHandPlay();
    } else {
      this.sortHands();
      this.sendGameInfo();
    }
  }

  startHandPlay(): void {
    this.stage = EHandStage.PLAY;

    const passedCards = this.players.map(({ chosenCardsIndexes, hand }) => (
      chosenCardsIndexes.map((index) => hand[index])
    ));

    this.players.forEach((player, index) => {
      this.players[this.getTargetPlayerIndex(index)].hand.push(
        ...passedCards[index],
      );

      player.hand = player.hand.filter((_card, index) => !player.chosenCardsIndexes.includes(index));
      player.chosenCardsIndexes = [];
    });

    this.sortHands();

    const startingPlayerIndex = this.players.findIndex(({ hand }) => hand.some(isDeuceOfClubs));
    const startingPlayer = this.players[startingPlayerIndex];

    this.startTurn(startingPlayerIndex);
    this.choosePlayerCard(startingPlayer, startingPlayer.hand.findIndex(isDeuceOfClubs));
  }

  startTurn(playerIndex: number): void {
    const startingPlayer = this.players[playerIndex];

    this.startTurnPlayerIndex = playerIndex;
    startingPlayer.isActive = true;
  }

  endTurn(playedCards: ICard[]): void {
    const highestCardPlayerIndex = getHighestCardIndex(playedCards, this.startTurnPlayerIndex);

    this.takeCards(this.players[highestCardPlayerIndex], playedCards);

    this.players.forEach((player) => {
      player.isActive = false;
      player.playedCard = null;
    });

    this.isFirstTurn = false;

    if (this.players.some(({ hand }) => hand.length === 0)) {
      this.endHand();
    } else {
      this.startTurn(highestCardPlayerIndex);
    }

    this.sendGameInfo();
  }

  endHand(): void {
    const playerScores = this.players.map((player) => (
      player.takenCards.reduce((score, card) => (
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

    this.players.forEach((player, index) => {
      player.score += index === takeAllPlayerIndex
        ? 0
        : takeAllPlayerIndex === -1
          ? playerScores[index]
          : ALL_SCORE;
    });

    if (this.players.some((player) => player.score >= 100)) {
      this.endGame();
    } else {
      this.startHand();
    }
  }

  endGame(): void {
    // TODO: end game
  }

  choosePlayerCard(player: IPlayer, cardIndex: number): void {
    if (this.stage === EHandStage.PASS) {
      if (player.chosenCardsIndexes.includes(cardIndex)) {
        player.chosenCardsIndexes = player.chosenCardsIndexes.filter((index) => index !== cardIndex);
      } else {
        player.chosenCardsIndexes.push(cardIndex);
      }

      if (this.players.every(({ chosenCardsIndexes }) => chosenCardsIndexes.length === PASS_CARDS_COUNT)) {
        this.startHandPlay();

        return;
      }
    } else {
      const activePlayerIndex = this.players.findIndex(({ isActive }) => isActive);

      player.playedCard = player.hand.splice(cardIndex, 1)[0] ?? null;
      player.isActive = false;

      const playedCards = this.players.map(({ playedCard }) => playedCard);

      if (playedCards.every(isDefined)) {
        setTimeout(() => {
          this.endTurn(playedCards);
        }, 2000);
      } else {
        this.players[(activePlayerIndex + 1) % this.players.length].isActive = true;
      }
    }

    this.sendGameInfo();
  }

  getTargetPlayerIndex(playerIndex: number): number {
    if (this.passDirection === EPassDirection.NONE) {
      return playerIndex;
    }

    if (this.passDirection === EPassDirection.LEFT) {
      return (playerIndex - 1 + this.players.length) % this.players.length;
    }

    if (this.passDirection === EPassDirection.RIGHT) {
      return (playerIndex + 1) % this.players.length;
    }

    return (playerIndex + 2) % this.players.length;
  }

  takeCards(player: IPlayer, cards: ICard[]): void {
    cards.forEach((card) => {
      player.takenCards.push(card);

      if (isHeart(card)) {
        this.heartsEnteredPlay = true;
      }
    });
  }

  sortHands(): void {
    this.players.forEach((player) => {
      player.hand = sortBy(player.hand, (card) => {
        return SUIT_VALUES[card.suit] + CARDS_SORT.indexOf(card.value);
      });
    });
  }

  sendGameInfo(): void {
    this.io.emit(EGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  onChooseCard({ socket, data }: IGameEvent<IChooseCardEvent>): void {
    const player = this.getPlayerByLogin(socket.user?.login);

    if (!player) {
      return;
    }

    this.choosePlayerCard(player, data.cardIndex);
  }

  onGetGameInfo({ socket }: IGameEvent): void {
    socket.emit(EGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  getGameInfoEvent(): IGameInfoEvent {
    return {
      stage: this.stage,
      players: this.players,
      passDirection: this.passDirection,
      startTurnPlayerIndex: this.startTurnPlayerIndex,
      heartsEnteredPlay: this.heartsEnteredPlay,
      isFirstTurn: this.isFirstTurn,
    };
  }
}

HeartsGame.initDecks();

export default HeartsGame;
