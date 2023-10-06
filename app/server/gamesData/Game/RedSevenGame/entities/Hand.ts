import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { Card, Hand as HandModel, HandPlayerData, Move, MoveType } from 'common/types/games/redSeven';

import { EntityGenerator } from 'common/utilities/Entity';
import { getCanvasRule, getRuleCards } from 'common/utilities/games/redSeven/rules';
import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import RedSevenGame from 'server/gamesData/Game/RedSevenGame/RedSevenGame';
import Turn from 'server/gamesData/Game/RedSevenGame/entities/Turn';

export interface HandOptions {
  deck: Card[];
}

export interface HandResult {
  winnerIndex: number;
  scoreCards: Card[];
}

export default class Hand extends ServerEntity<GameType.RED_SEVEN, HandResult> {
  game: RedSevenGame;

  playersData: HandPlayerData[] = this.getPlayersData(() => ({
    inPlay: true,
    hand: [],
    palette: [],
  }));
  turnController = new TurnController({
    players: this.playersData,
    isPlayerInPlay: (playerIndex) => this.playersData[playerIndex].inPlay,
  });
  canvas: Card[] = [];
  deck: Card[];

  turn: Turn | null = null;

  constructor(game: RedSevenGame, options: HandOptions) {
    super(game);

    this.game = game;
    this.deck = options.deck;
  }

  *lifecycle(): EntityGenerator<HandResult> {
    this.deck = shuffle(this.deck);

    this.forEachPlayer((playerIndex) => {
      const playerData = this.playersData[playerIndex];

      playerData.hand = this.deck.splice(-7);
      playerData.palette = this.deck.splice(-1);
    });

    let winnerIndex = -1;

    while ((winnerIndex = this.getWinnerIndex()) === -1) {
      this.turn = new Turn(this);

      const inPlay = yield* this.waitForEntity(this.turn);

      if (!inPlay) {
        // TODO: show modal
        // TODO: special modal if last player
      }

      this.turnController.getActivePlayer().inPlay = inPlay;

      this.turnController.passTurn();
    }

    this.turn = null;

    return {
      winnerIndex,
      scoreCards: getRuleCards(this.playersData[winnerIndex].palette, getCanvasRule(this.canvas)),
    };
  }

  getWinnerIndex(): number {
    let winnerIndex = -1;

    for (const [playerIndex, { inPlay }] of this.playersData.entries()) {
      if (!inPlay) {
        continue;
      }

      if (winnerIndex !== -1) {
        return -1;
      }

      winnerIndex = playerIndex;
    }

    return winnerIndex;
  }

  playMove(move: Move): void {
    if (move.type === MoveType.ADD_CARD_TO_PALETTE) {
      const { hand, palette } = this.turnController.getActivePlayer();

      palette.push(...hand.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_HAND_TO_CANVAS) {
      const { hand } = this.turnController.getActivePlayer();

      this.canvas.push(...hand.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS) {
      const { palette } = this.turnController.getActivePlayer();

      this.canvas.push(...palette.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_DECK) {
      const { palette } = this.playersData[move.playerIndex];

      this.deck.push(...palette.splice(move.cardIndex, 1));
    }
  }

  revertMove(move: Move): void {
    if (!move.isRevertable) {
      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_PALETTE) {
      const { hand, palette } = this.turnController.getActivePlayer();

      hand.splice(move.cardIndex, 0, ...palette.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_HAND_TO_CANVAS) {
      const { hand } = this.turnController.getActivePlayer();

      hand.splice(move.cardIndex, 0, ...this.canvas.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS) {
      const { palette } = this.turnController.getActivePlayer();

      palette.splice(move.cardIndex, 0, ...this.canvas.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_DECK) {
      const { palette } = this.playersData[move.playerIndex];

      palette.splice(move.cardIndex, 0, ...this.deck.splice(-1));

      return;
    }
  }

  toJSON(): HandModel {
    return {
      canvas: this.canvas,
      deck: this.deck,
    };
  }
}
