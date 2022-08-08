import pick from 'lodash/pick';

import {
  EGame,
  TGameClientEvent,
  TGameClientEventData,
  TGameServerDatalessEvent,
  TGameServerEvent,
  TGameServerEventData,
  TPlayerSettings,
} from 'common/types/game';
import { IGamePlayer } from 'common/types';

import Entity, { TEffectGenerator, TGenerator } from 'server/gamesData/Game/utilities/Entity';

import { ISendSocketEventOptions } from 'server/gamesData/Game/Game';

export interface IWaitForSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>> {
  validate?(data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

export interface IWaitForSocketEventsOptions<Game extends EGame, Event extends TGameClientEvent<Game>> {
  validate?(event: Event, data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

export interface IWaitForSocketEventResult<Game extends EGame, Event extends TGameClientEvent<Game>> {
  data: TGameClientEventData<Game, Event>;
  playerIndex: number;
}

export type IWaitForSocketEventsResult<Game extends EGame, Event extends TGameClientEvent<Game>> = {
  [E in Event]: {
    event: E;
  } & IWaitForSocketEventResult<Game, E>;
}[Event];

export interface IWaitForPlayerSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>>
  extends IWaitForSocketEventOptions<Game, Event> {
  playerIndex: number;
}

export interface IWaitForPlayerSocketEventsOptions<Game extends EGame, Event extends TGameClientEvent<Game>>
  extends IWaitForSocketEventsOptions<Game, Event> {
  playerIndex: number;
}

export type TWaitForPlayerSocketEventsResult<Game extends EGame, Event extends TGameClientEvent<Game>> = {
  [E in Event]: {
    event: E;
    data: TGameClientEventData<Game, E>;
  };
}[Event];

export default abstract class ServerEntity<Game extends EGame, Result = unknown> extends Entity<Game, Result> {
  static #validate(data: unknown, validator?: (data: unknown) => unknown): boolean {
    try {
      validator?.(data);

      return true;
    } catch {
      return false;
    }
  }

  forEachPlayer(callback: (playerIndex: number) => unknown): void {
    this.getPlayers().forEach(({ index }) => callback(index));
  }

  getPlayer(playerIndex: number): IGamePlayer<Game> {
    return this.context.game.players[playerIndex];
  }

  getPlayerSettings(playerIndex: number): TPlayerSettings<Game> {
    return this.getPlayer(playerIndex)?.settings;
  }

  getPlayers(): IGamePlayer<Game>[] {
    return this.context.game.players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (IGamePlayer<Game> & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']),
      data: callback(player.index),
    }));
  }

  get playersCount(): number {
    return this.getPlayers().length;
  }

  *listenForEvent<Event extends TGameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (result: IWaitForSocketEventResult<Game, Event>) => Result | void,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TEffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        try {
          if (ServerEntity.#validate(data, options?.validate)) {
            const result = callback({
              data,
              playerIndex,
            });

            if (result !== undefined) {
              resolve(result);
            }
          }
        } catch (err) {
          reject(err);
        }
      });
    };
  }

  *listenForPlayerEvent<Event extends TGameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: TGameClientEventData<Game, Event>) => Result | void,
    options: IWaitForPlayerSocketEventOptions<Game, Event>,
  ): TEffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.context.game.listenSocketEvent(
        event,
        (data) => {
          try {
            if (ServerEntity.#validate(data, options?.validate)) {
              const result = callback(data);

              if (result !== undefined) {
                resolve(result);
              }
            }
          } catch (err) {
            reject(err);
          }
        },
        options.playerIndex,
      );
    };
  }

  sendSocketEvent<Event extends TGameServerDatalessEvent<Game>>(
    event: Event,
    data?: undefined,
    options?: ISendSocketEventOptions<Game>,
  ): void;
  sendSocketEvent<Event extends TGameServerEvent<Game>>(
    event: Event,
    data: TGameServerEventData<Game, Event>,
    options?: ISendSocketEventOptions<Game>,
  ): void;
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
          if (ServerEntity.#validate(data, options?.validate)) {
            resolve(data);
          }
        },
        options.playerIndex,
      );
    };
  }

  waitForPlayerSocketEvents<Event extends TGameClientEvent<Game>>(
    events: Event[],
    options: IWaitForPlayerSocketEventsOptions<Game, Event>,
  ): TEffectGenerator<TWaitForPlayerSocketEventsResult<Game, Event>> {
    const entity = this;

    return this.race(
      events.map(function* (event): TGenerator<TWaitForPlayerSocketEventsResult<Game, Event>> {
        return {
          event,
          data: yield* entity.waitForPlayerSocketEvent<Event>(event, {
            ...options,
            validate: (data) => {
              options?.validate?.(event, data);
            },
          }),
        };
      }),
    );
  }

  *waitForSocketEvent<Event extends TGameClientEvent<Game>>(
    event: Event,
    options?: IWaitForSocketEventOptions<Game, Event>,
  ): TEffectGenerator<IWaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      return this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        if (ServerEntity.#validate(data, options?.validate)) {
          resolve({
            data,
            playerIndex,
          });
        }
      });
    };
  }

  waitForSocketEvents<Event extends TGameClientEvent<Game>>(
    events: Event[],
    options?: IWaitForSocketEventsOptions<Game, Event>,
  ): TEffectGenerator<IWaitForSocketEventsResult<Game, Event>> {
    const entity = this;

    return this.race(
      events.map(function* (event): TGenerator<IWaitForSocketEventsResult<Game, Event>> {
        return {
          event,
          ...(yield* entity.waitForSocketEvent<Event>(event, {
            ...options,
            validate: (data) => {
              options?.validate?.(event, data);
            },
          })),
        };
      }),
    );
  }
}
