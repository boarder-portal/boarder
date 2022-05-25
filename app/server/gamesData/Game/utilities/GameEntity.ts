import { EGame, TGameInfo } from 'common/types/game';
import { ECommonGameServerEvent } from 'common/types';

import ServerEntity from 'server/gamesData/Game/utilities/ServerEntity';

export default abstract class GameEntity<Game extends EGame> extends ServerEntity<Game, void> {
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
