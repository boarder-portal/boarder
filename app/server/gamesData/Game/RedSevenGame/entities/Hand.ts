import shuffle from 'lodash/shuffle';

import { GameType } from 'common/types/game';
import { Card, Hand as HandModel, HandPlayerData, Move, MoveType } from 'common/types/games/redSeven';

import { getCanvasRule, getRuleCards } from 'common/utilities/games/redSeven/rules';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import Turn from 'server/gamesData/Game/RedSevenGame/entities/Turn';

export interface HandOptions {
  deck: Card[];
}

export interface HandResult {
  winnerIndex: number;
  scoreCards: Card[];
}

export default class Hand extends Entity<HandResult> {
  turnController = this.addComponent(TurnController, {
    // TODO: pass valid start index
    isPlayerInPlay: (playerIndex) => this.playersData.get(playerIndex).inPlay,
  });
  gameInfo = this.obtainComponent(GameInfo<GameType.RED_SEVEN, this>);

  playersData = this.gameInfo.createPlayersData<HandPlayerData>({
    init: () => ({
      inPlay: true,
      hand: [],
      palette: [],
    }),
  });
  canvas: Card[] = [];
  deck: Card[];

  turn: Turn | null = null;

  constructor(options: HandOptions) {
    super();

    this.deck = options.deck;
  }

  *lifecycle(): EntityGenerator<HandResult> {
    this.deck = shuffle(this.deck);

    this.gameInfo.forEachPlayer((playerIndex) => {
      const playerData = this.playersData.get(playerIndex);

      playerData.hand = this.deck.splice(-7);
      playerData.palette = this.deck.splice(-1);
    });

    let winnerIndex = -1;

    while ((winnerIndex = this.getWinnerIndex()) === -1) {
      this.turn = this.spawnEntity(Turn);

      const inPlay = yield* this.waitForEntity(this.turn);

      if (!inPlay) {
        // TODO: show modal
        // TODO: special modal if last player
      }

      this.playersData.getActive().inPlay = inPlay;

      this.turnController.passTurn();
    }

    this.turn = null;

    return {
      winnerIndex,
      scoreCards: getRuleCards(this.playersData.get(winnerIndex).palette, getCanvasRule(this.canvas)),
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
      const { hand, palette } = this.playersData.getActive();

      palette.push(...hand.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_HAND_TO_CANVAS) {
      const { hand } = this.playersData.getActive();

      this.canvas.push(...hand.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS) {
      const { palette } = this.playersData.getActive();

      this.canvas.push(...palette.splice(move.cardIndex, 1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_DECK) {
      const { palette } = this.playersData.get(move.playerIndex);

      this.deck.push(...palette.splice(move.cardIndex, 1));
    }
  }

  revertMove(move: Move): void {
    if (!move.isRevertable) {
      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_PALETTE) {
      const { hand, palette } = this.playersData.getActive();

      hand.splice(move.cardIndex, 0, ...palette.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_HAND_TO_CANVAS) {
      const { hand } = this.playersData.getActive();

      hand.splice(move.cardIndex, 0, ...this.canvas.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_FROM_PALETTE_TO_CANVAS) {
      const { palette } = this.playersData.getActive();

      palette.splice(move.cardIndex, 0, ...this.canvas.splice(-1));

      return;
    }

    if (move.type === MoveType.ADD_CARD_TO_DECK) {
      const { palette } = this.playersData.get(move.playerIndex);

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
