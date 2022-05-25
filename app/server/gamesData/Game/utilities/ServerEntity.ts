import {
  EGame,
  TGameClientEvent,
  TGameClientEventData,
  TGameServerEvent,
  TGameServerEventData,
} from 'common/types/game';
import { IGamePlayer } from 'common/types';

import Entity, {
  IWaitForPlayerSocketEventOptions,
  IWaitForSocketEventOptions,
  IWaitForSocketEventResult,
  TEffectGenerator,
} from 'server/gamesData/Game/utilities/Entity';

import { ISendSocketEventOptions } from 'server/gamesData/Game/Game';

export default abstract class ServerEntity<Game extends EGame, Result = unknown> extends Entity<Game, Result> {
  forEachPlayer(callback: (playerIndex: number) => unknown): void {
    this.getPlayers().forEach(({ index }) => callback(index));
  }

  getPlayers(): IGamePlayer[] {
    return this.context.game.players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (IGamePlayer & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...player,
      data: callback(player.index),
    }));
  }

  get playersCount(): number {
    return this.getPlayers().length;
  }

  sendSocketEvent<Event extends TGameServerEvent<Game>>(
    event: Event,
    data: TGameServerEventData<Game, Event>,
    options?: ISendSocketEventOptions<Game>,
  ): void {
    this.context.game.sendSocketEvent(event, data, options);
  }

  *waitForPlayerSocketEvent<Event extends TGameClientEvent<Game>>(
    event: Event,
    options: IWaitForPlayerSocketEventOptions<Game, Event>,
  ): TEffectGenerator<TGameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.context.game.listenSocketEvent(
        event,
        (data) => {
          try {
            if (options?.validate?.(data) ?? true) {
              resolve(data);
            }
          } catch {
            // empty
          }
        },
        options.playerIndex,
      );
    };
  }

  *waitForSocketEvent<Event extends TGameClientEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TEffectGenerator<IWaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      return this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        try {
          if (options?.validate?.(data) ?? true) {
            resolve({
              data,
              playerIndex,
            });
          }
        } catch {
          // empty
        }
      });
    };
  }
}
