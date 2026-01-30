import { DRAFT_PHASE_CARDS_COUNT_TARGET, DRAFT_PHASE_DRAW_CARDS_COUNT } from 'common/constants/games/outerMinds';

import { GameType } from 'common/types/game';
import {
  GamePhaseType,
  HandDraftPhase as HandDraftPhaseModel,
  HandDraftPlayerData,
} from 'common/types/games/outerMinds';
import { CardId } from 'common/types/games/outerMinds/cards';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayersData from 'server/gamesData/Game/utilities/Entity/components/PlayersData';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import { HandDraftTurn } from 'server/gamesData/Game/OuterMindsGame/entities/HandDraftTurn';

export interface HandDraftPhaseOptions {
  deck: CardId[];
}

export interface HandDraftPhaseResult {
  pickedCards: CardId[][];
  restCards: CardId[];
}

export default class HandDraftPhase extends Entity<HandDraftPhaseResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.OUTER_MINDS, this>);

  turnController = this.addComponent(TurnController);

  playersData = this.addComponent(PlayersData<HandDraftPlayerData, this>, {
    init: () => ({
      pickedCards: [],
    }),
  });

  deck: CardId[];
  discard: CardId[] = [];

  turn: HandDraftTurn | null = null;

  constructor(options: HandDraftPhaseOptions) {
    super();

    this.deck = options.deck;
  }

  *lifecycle(): EntityGenerator<HandDraftPhaseResult> {
    while (!this.allCardsPicked()) {
      this.turn = this.spawnEntity(HandDraftTurn, {
        cards: this.drawCardsFromDeck(),
      });

      const { pickedCards, discardedCards } = yield* this.waitForEntity(this.turn);

      this.playersData.getActive().pickedCards.push(...pickedCards);
      this.discard.push(...discardedCards);
    }

    return {
      pickedCards: this.playersData.map(({ pickedCards }) => pickedCards),
      restCards: [...this.discard, ...this.deck],
    };
  }

  allCardsPicked(): boolean {
    return this.playersData.every(({ pickedCards }) => pickedCards.length >= DRAFT_PHASE_CARDS_COUNT_TARGET);
  }

  drawCardsFromDeck(): CardId[] {
    return this.deck.splice(-DRAFT_PHASE_DRAW_CARDS_COUNT);
  }

  toJSON(): HandDraftPhaseModel {
    return {
      type: GamePhaseType.HAND_DRAFT,
      deck: this.deck,
      activePlayerIndex: this.turnController.activePlayerIndex,
      turn: this.turn?.toJSON() ?? null,
    };
  }
}
