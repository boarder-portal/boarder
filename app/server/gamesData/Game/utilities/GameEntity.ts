import { Socket } from 'socket.io';

import { ECommonGameEvent, EGame, TGameInfo } from 'common/types/game';

import Entity from 'server/gamesData/Game/utilities/Entity';

export default abstract class GameEntity<Game extends EGame> extends Entity<Game, void> {
  spawned = true;

  abstract toJSON(): TGameInfo<Game>;

  sendGameInfo(socket?: Socket): void {
    this.sendSocketEvent(ECommonGameEvent.GET_INFO, this.toJSON(), socket);
  }
}
