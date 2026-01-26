import { GameType } from 'common/types/game';
import { Game, GamePlayerData, GameResult, Player } from 'common/types/games/outerMinds';

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

  handDraftPhase: HandDraftPhase | null = null;
  playPhase: PlayPhase | null = null;

  *lifecycle(): EntityGenerator<GameResult> {}

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
    };
  }
}
