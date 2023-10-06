import {
  GameClientEvent,
  GameClientEventData,
  GameServerDatalessEvent,
  GameServerEvent,
  GameServerEventData,
  GameType,
} from 'common/types/game';

import { EffectGenerator, EntityGenerator } from 'common/utilities/Entity';
import AbstractGameEntity from 'server/gamesData/Game/utilities/AbstractGameEntity';
import TurnController from 'server/gamesData/Game/utilities/TurnController';

import { SendSocketEventOptions } from 'server/gamesData/Game/Game';

export interface WaitForSocketEventOptions<Game extends GameType, Event extends GameClientEvent<Game>> {
  validate?(data: GameClientEventData<Game, Event>): boolean;
}

export interface WaitForSocketEventsOptions<Game extends GameType, Event extends GameClientEvent<Game>> {
  validate?: {
    [E in Event]?: (data: GameClientEventData<Game, E>) => boolean;
  };
}

export interface WaitForSocketEventResult<Game extends GameType, Event extends GameClientEvent<Game>> {
  data: GameClientEventData<Game, Event>;
  playerIndex: number;
}

export type WaitForSocketEventsResult<Game extends GameType, Event extends GameClientEvent<Game>> = {
  [E in Event]: {
    event: E;
  } & WaitForSocketEventResult<Game, E>;
}[Event];

export interface WaitForActivePlayerSocketEventOptions<Game extends GameType, Event extends GameClientEvent<Game>>
  extends WaitForSocketEventOptions<Game, Event> {
  turnController: TurnController<any>;
}

export interface WaitForActivePlayerSocketEventsOptions<Game extends GameType, Event extends GameClientEvent<Game>>
  extends WaitForSocketEventsOptions<Game, Event> {
  turnController: TurnController<any>;
}

export interface WaitForPlayerSocketEventOptions<Game extends GameType, Event extends GameClientEvent<Game>>
  extends WaitForSocketEventOptions<Game, Event> {
  playerIndex: number;
}

export interface WaitForPlayerSocketEventsOptions<Game extends GameType, Event extends GameClientEvent<Game>>
  extends WaitForSocketEventsOptions<Game, Event> {
  playerIndex: number;
}

export type WaitForPlayerSocketEventsResult<Game extends GameType, Event extends GameClientEvent<Game>> = {
  [E in Event]: {
    event: E;
    data: GameClientEventData<Game, E>;
  };
}[Event];

export default abstract class ServerEntity<Game extends GameType, Result = unknown> extends AbstractGameEntity<
  Game,
  Result
> {
  static validate<Data>(data: Data, validator?: (data: Data) => unknown): boolean {
    try {
      validator?.(data);

      return true;
    } catch {
      return false;
    }
  }

  *listenForEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (result: WaitForSocketEventResult<Game, Event>) => Result | void,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.getGame().listenSocketEvent(event, (data, playerIndex) => {
        if (this.paused) {
          return;
        }

        try {
          if (ServerEntity.validate(data, options?.validate)) {
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

  *listenForPlayerEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.getGame().listenSocketEvent(
        event,
        (data) => {
          if (this.paused) {
            return;
          }

          try {
            if (ServerEntity.validate(data, options?.validate)) {
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

  sendSocketEvent<Event extends GameServerDatalessEvent<Game>>(
    event: Event,
    data?: undefined,
    options?: SendSocketEventOptions<Game>,
  ): void;
  sendSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
    data: GameServerEventData<Game, Event>,
    options?: SendSocketEventOptions<Game>,
  ): void;
  sendSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
    data: GameServerEventData<Game, Event>,
    options?: SendSocketEventOptions<Game>,
  ): void {
    this.getGame().sendSocketEvent(event, data, options);
  }

  *waitForActivePlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options: WaitForActivePlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.getGame().listenSocketEvent(
        event,
        (data) => {
          if (this.paused) {
            return;
          }

          if (ServerEntity.validate(data, options?.validate)) {
            resolve(data);
          }
        },
        options.turnController.activePlayerIndex,
      );
    };
  }

  waitForActivePlayerSocketEvents<Event extends GameClientEvent<Game>>(
    events: Event[],
    options: WaitForActivePlayerSocketEventsOptions<Game, Event>,
  ): EffectGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
    const entity = this;

    return this.race(
      events.map(function* (event): EntityGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
        return {
          event,
          data: yield* entity.waitForActivePlayerSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          }),
        };
      }),
    );
  }

  *waitForPlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.getGame().listenSocketEvent(
        event,
        (data) => {
          if (this.paused) {
            return;
          }

          if (ServerEntity.validate(data, options?.validate)) {
            resolve(data);
          }
        },
        options.playerIndex,
      );
    };
  }

  waitForPlayerSocketEvents<Event extends GameClientEvent<Game>>(
    events: Event[],
    options: WaitForPlayerSocketEventsOptions<Game, Event>,
  ): EffectGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
    const entity = this;

    return this.race(
      events.map(function* (event): EntityGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
        return {
          event,
          data: yield* entity.waitForPlayerSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          }),
        };
      }),
    );
  }

  *waitForSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<WaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      return this.getGame().listenSocketEvent(event, (data, playerIndex) => {
        if (this.paused) {
          return;
        }

        if (ServerEntity.validate(data, options?.validate)) {
          resolve({
            data,
            playerIndex,
          });
        }
      });
    };
  }

  waitForSocketEvents<Event extends GameClientEvent<Game>>(
    events: Event[],
    options?: WaitForSocketEventsOptions<Game, Event>,
  ): EffectGenerator<WaitForSocketEventsResult<Game, Event>> {
    const entity = this;

    return this.race(
      events.map(function* (event): EntityGenerator<WaitForSocketEventsResult<Game, Event>> {
        return {
          event,
          ...(yield* entity.waitForSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          })),
        };
      }),
    );
  }
}
