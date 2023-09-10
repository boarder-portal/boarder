import pick from 'lodash/pick';

import { GamePlayer } from 'common/types';
import {
  GameClientEvent,
  GameClientEventData,
  GameServerDatalessEvent,
  GameServerEvent,
  GameServerEventData,
  GameType,
  PlayerSettings,
} from 'common/types/game';

import Entity, { EffectGenerator, EntityGenerator } from 'server/gamesData/Game/utilities/Entity';

import { SendSocketEventOptions } from 'server/gamesData/Game/Game';

export interface WaitForSocketEventOptions<Game extends GameType, Event extends GameClientEvent<Game>> {
  validate?(data: unknown): asserts data is GameClientEventData<Game, Event>;
}

export interface WaitForSocketEventsOptions<Game extends GameType, Event extends GameClientEvent<Game>> {
  validate?(event: Event, data: unknown): asserts data is GameClientEventData<Game, Event>;
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

export default abstract class ServerEntity<Game extends GameType, Result = unknown> extends Entity<Game, Result> {
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

  getPlayer(playerIndex: number): GamePlayer<Game> {
    return this.context.game.players[playerIndex];
  }

  getPlayerSettings(playerIndex: number): PlayerSettings<Game> {
    return this.getPlayer(playerIndex)?.settings;
  }

  getPlayers(): GamePlayer<Game>[] {
    return this.context.game.players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (GamePlayer<Game> & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot', 'settings']),
      data: callback(player.index),
    }));
  }

  get playersCount(): number {
    return this.getPlayers().length;
  }

  *listenForEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (result: WaitForSocketEventResult<Game, Event>) => Result | void,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this.paused) {
          return;
        }

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

  *listenForPlayerEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.context.game.listenSocketEvent(
        event,
        (data) => {
          if (this.paused) {
            return;
          }

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
    this.context.game.sendSocketEvent(event, data, options);
  }

  *waitForPlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.context.game.listenSocketEvent(
        event,
        (data) => {
          if (this.paused) {
            return;
          }

          if (ServerEntity.#validate(data, options?.validate)) {
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
            validate: (data) => {
              options?.validate?.(event, data);
            },
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
      return this.context.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this.paused) {
          return;
        }

        if (ServerEntity.#validate(data, options?.validate)) {
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
            validate: (data) => {
              options?.validate?.(event, data);
            },
          })),
        };
      }),
    );
  }
}
