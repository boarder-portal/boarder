import { EGame, TGameInfo } from 'common/types/game';
import { ECommonGameServerEvent } from 'common/types';

import Entity from 'server/gamesData/Game/utilities/Entity';

export default abstract class GameEntity<Game extends EGame> extends Entity<Game, void> {
  spawned = true;

  abstract toJSON(): TGameInfo<Game>;

  getGameInfo(): TGameInfo<Game> {
    return this.toJSON();
  }

  sendGameInfo(): void {
    this.sendSocketEvent(ECommonGameServerEvent.GET_INFO, this.getGameInfo(), {
      batch: true,
    });
  }
}
