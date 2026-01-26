import { GameType } from 'common/types/game';
import {
  GamePhaseType,
  HandDraftPhase as HandDraftPhaseModel,
  HandDraftPlayerData,
} from 'common/types/games/outsideMind';
import { CardId } from 'common/types/games/outsideMind/cards';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayersData from 'server/gamesData/Game/utilities/Entity/components/PlayersData';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import { HandDraftTurn } from 'server/gamesData/Game/OutsideMindGame/entities/HandDraftTurn';

export default class HandDraftPhase extends Entity<CardId[][]> {
  gameInfo = this.obtainComponent(GameInfo<GameType.OUTSIDE_MIND, this>);

  turnController = this.addComponent(TurnController);

  playersData = this.addComponent(PlayersData<HandDraftPlayerData, this>, {
    init: () => ({
      pickedCards: [],
    }),
  });
  deck: CardId[] = [];

  turn: HandDraftTurn | null = null;

  *lifecycle(): EntityGenerator<CardId[][]> {
    // TODO: logic
    return [];
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
