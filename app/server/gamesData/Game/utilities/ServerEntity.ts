import pick from 'lodash/pick';

import {
  EGame,
  TGameClientEvent,
  TGameClientEventData,
  TGameServerEvent,
  TGameServerEventData,
} from 'common/types/game';
import { IGamePlayer } from 'common/types';

import Entity, { TEffectGenerator } from 'server/gamesData/Game/utilities/Entity';

import { ISendSocketEventOptions } from 'server/gamesData/Game/Game';

export interface IWaitForSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>> {
  validate?(data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

export interface IWaitForSocketEventResult<Game extends EGame, Event extends TGameClientEvent<Game>> {
  data: TGameClientEventData<Game, Event>;
  playerIndex: number;
}

export interface IWaitForPlayerSocketEventOptions<Game extends EGame, Event extends TGameClientEvent<Game>>
  extends IWaitForSocketEventOptions<Game, Event> {
  playerIndex: number;
  validate?(data: unknown): asserts data is TGameClientEventData<Game, Event>;
}

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

  getPlayers(): IGamePlayer[] {
    return this.context.game.players;
  }

  getPlayersData<Data>(callback: (playerIndex: number) => Data): Data[] {
    return this.getPlayers().map(({ index }) => callback(index));
  }

  getPlayersWithData<Data>(callback: (playerIndex: number) => Data): (IGamePlayer & { data: Data })[] {
    return this.getPlayers().map((player) => ({
      ...pick(player, ['login', 'name', 'status', 'index', 'isBot']),
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
}
