import shuffle from 'lodash/shuffle';
import times from 'lodash/times';

import { STARTING_BUILDING_CARDS } from 'common/constants/games/outerMinds/cards';
import { CITY_HEIGHT, CITY_WIDTH } from 'common/constants/games/outerMinds/city';

import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, Player } from 'common/types/games/outerMinds';
import { City } from 'common/types/games/outerMinds/city';

import { getFreshBuilding } from 'common/utilities/games/outerMinds/cards/buildings';
import Entity, { EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import PlayersData from 'server/gamesData/Game/utilities/Entity/components/PlayersData';

import HandDraftPhase from 'server/gamesData/Game/OuterMindsGame/entities/HandDraftPhase';
import PlayPhase from 'server/gamesData/Game/OuterMindsGame/entities/PlayPhase';

export default class OuterMindsGame extends Entity<GameResult> {
  gameInfo = this.obtainComponent(GameInfo<GameType.OUTER_MINDS, this>);

  playersData = this.addComponent(PlayersData<GamePlayerData, this>, {
    init: () => ({}),
  });

  city: City = [];

  handDraftPhase: HandDraftPhase | null = null;
  playPhase: PlayPhase | null = null;

  *lifecycle(): EntityGenerator<GameResult> {
    const startingBuildingCards = shuffle(STARTING_BUILDING_CARDS);

    this.city = times(CITY_HEIGHT, () =>
      times(CITY_WIDTH, () => {
        const cardId = startingBuildingCards.pop();

        if (!cardId) {
          throw new Error('No card id');
        }

        return getFreshBuilding({
          cardId,
          city: this.city,
        });
      }),
    );
  }

  getGamePlayers(): Player[] {
    return this.gameInfo.getPlayersWithData((playerIndex) => ({
      ...this.playersData.get(playerIndex),
      handDraft: this.handDraftPhase?.playersData.get(playerIndex) ?? null,
      play: this.playPhase?.playersData.get(playerIndex) ?? null,
    }));
  }

  toJSON(): Game {
    return {
      players: this.getGamePlayers(),
      phase: this.handDraftPhase?.toJSON() ?? this.playPhase?.toJSON() ?? null,
      city: this.city,
    };
  }
}
