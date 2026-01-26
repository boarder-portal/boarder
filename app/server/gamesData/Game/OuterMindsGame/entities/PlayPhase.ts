import { GameType } from 'common/types/game';
import {
  GamePhaseType,
  GameResult,
  PlayPhase as PlayPhaseModel,
  PlayPhasePlayerData,
} from 'common/types/games/outerMinds';
import { BuildingCardId, CardId, CardWithInventory } from 'common/types/games/outerMinds/cards';

import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayersData from 'server/gamesData/Game/utilities/Entity/components/PlayersData';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';

import { HandDraftTurn } from 'server/gamesData/Game/OuterMindsGame/entities/HandDraftTurn';

export interface PlayPhaseOptions {
  hands: CardId[][];
}

export default class PlayPhase extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.OUTER_MINDS, this>);

  turnController = this.addComponent(TurnController);

  playersData: PlayersData<PlayPhasePlayerData, this>;
  city: CardWithInventory<BuildingCardId>[][] = [];

  turn: HandDraftTurn | null = null;

  constructor(options: PlayPhaseOptions) {
    super();

    this.playersData = this.addComponent(PlayersData<PlayPhasePlayerData, this>, {
      init: (index) => ({
        hand: options.hands[index],
        observations: [],
        abilities: [],
        humans: [],
        energy: 0,
        score: 0,
      }),
    });
  }

  *lifecycle(): EntityGenerator<GameResult> {}

  toJSON(): PlayPhaseModel {
    return {
      type: GamePhaseType.PLAY,
      city: [],
    };
  }
}
