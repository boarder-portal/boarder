import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';

import { DECK } from 'common/constants/games/common/cards';

import { IPlayer as ICommonPlayer } from 'common/types';
import { EGameEvent, EHandStage, EPassDirection, IChooseCardEvent, IGameInfoEvent, IPlayer } from 'common/types/hearts';
import { EGame } from 'common/types/game';
import { ESuit, EValue, ICard } from 'common/types/cards';
import { IGameEvent } from 'server/types';

import { getRandomElement } from 'common/utilities/random';
import { isEqualCardsCallback } from 'common/utilities/cards/isEqualCards';
import getCard from 'common/utilities/cards/getCard';

import Game, { IGameCreateOptions } from 'server/gamesData/Game/Game';

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

  constructor(options: IGameCreateOptions<EGame.HEARTS>) {
    super(options);

    this.createGameInfo();
  }

  createGameInfo(): void {
    getRandomElement(this.players).isActive = true;

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
      handScore: 0,
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

    this.players.forEach((player, index) => {
      player.hand = shuffledDeck[index];
      player.handScore = 0;
    });

    this.sendGameInfo();
  }

  endHand(): void {

  }

  choosePlayerCard(player: IPlayer, cardIndex: number): void {
    if (this.stage === EHandStage.PASS) {
      if (player.chosenCardsIndexes.includes(cardIndex)) {
        player.chosenCardsIndexes = player.chosenCardsIndexes.filter((index) => index !== cardIndex);
      } else {
        player.chosenCardsIndexes.push(cardIndex);
      }
    } else {
      player.playedCard = player.hand.splice(cardIndex, 1)[0] ?? null;
    }

    this.sendGameInfo();
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
    console.log('on get info');
    socket.emit(EGameEvent.GAME_INFO, this.getGameInfoEvent());
  }

  getGameInfoEvent(): IGameInfoEvent {
    return {
      stage: this.stage,
      players: this.players,
      passDirection: this.passDirection,
    };
  }
}

HeartsGame.initDecks();

export default HeartsGame;
