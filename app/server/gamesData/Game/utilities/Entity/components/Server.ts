import { ChangeSettingEvent, CommonGameClientEvent, CommonGameServerEvent } from 'common/types';
import {
  GameClientEvent,
  GameClientEventData,
  GameServerDatalessEvent,
  GameServerEvent,
  GameServerEventData,
  GameType,
  PlayerSettings,
} from 'common/types/game';

import { now } from 'common/utilities/time';
import Entity, { AnyEntity, EffectGenerator, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';
import Player from 'server/gamesData/Game/utilities/Entity/components/Player';
import Time from 'server/gamesData/Game/utilities/Entity/components/Time';
import TurnController from 'server/gamesData/Game/utilities/Entity/components/TurnController';
import GameRoot from 'server/gamesData/Game/utilities/Entity/entities/GameRoot';

import { SendSocketEventOptions } from 'server/gamesData/Game/Game';

export type SettingsChangeEvent<Game extends GameType> = {
  playerIndex: number;
  settings: PlayerSettings<Game>;
} & ChangeSettingEvent<Game>;

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

export interface ServerOptions {
  player?: Player;
  turnController?: TurnController;
}

export default class Server<Game extends GameType, E extends AnyEntity = Entity> extends EntityComponent<E> {
  readonly #gameRoot = this.entity.getClosestEntity(GameRoot<Game>);

  readonly #gameInfo = this.entity.obtainComponent(GameInfo<Game, E>);
  readonly #time = this.entity.obtainComponent(Time);

  readonly #optionsPlayer?: Player;
  readonly #optionsTurnController?: TurnController;

  constructor(options?: ServerOptions) {
    super();

    this.#optionsTurnController = options?.turnController;
  }

  get #player(): Player {
    return this.#optionsPlayer ?? this.entity.getClosestComponent(Player);
  }

  get #turnController(): TurnController {
    return this.#optionsTurnController ?? this.entity.getClosestComponent(TurnController);
  }

  #getSettingChangeEvent(playerIndex: number, event: ChangeSettingEvent<Game>): SettingsChangeEvent<Game> {
    return {
      playerIndex,
      settings: this.#gameInfo.getPlayerSettings(playerIndex),
      ...event,
    };
  }

  #isTimePaused(): boolean {
    return this.#time.paused;
  }

  #validate<Data>(data: Data, validator?: (data: Data) => unknown): boolean {
    try {
      validator?.(data);

      return true;
    } catch {
      return false;
    }
  }

  *listenForOwnSocketEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EntityGenerator<Result> {
    return yield* this.listenForPlayerSocketEvent(event, callback, {
      ...options,
      playerIndex: this.#player.index,
    });
  }

  *listenForPlayerSocketEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.#gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this.#isTimePaused()) {
            return;
          }

          try {
            if (this.#validate(data, options?.validate)) {
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

  *listenForSocketEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (result: WaitForSocketEventResult<Game, Event>) => Result | void,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this.#gameInfo.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this.#isTimePaused()) {
          return;
        }

        try {
          if (this.#validate(data, options?.validate)) {
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

  *listenForSettingsChange<Result = void>(
    callback: (event: SettingsChangeEvent<Game>) => Result,
  ): EntityGenerator<Result> {
    return yield* this.listenForSocketEvent(CommonGameClientEvent.CHANGE_SETTING, ({ data, playerIndex }) =>
      callback(this.#getSettingChangeEvent(playerIndex, data as any)),
    );
  }

  ping(): void {
    this.sendSocketEvent(CommonGameServerEvent.PING, now());
  }

  *pingIndefinitely(interval: number): EntityGenerator {
    const server = this;

    yield* this.#time.repeatTask(interval, function* () {
      server.ping();
    });
  }

  sendGameInfo(): void {
    try {
      this.sendSocketEvent(CommonGameServerEvent.GET_INFO, this.#gameRoot.getGameInfo(), {
        batch: true,
      });
    } catch {
      // empty
    }
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
    this.#gameInfo.game.sendSocketEvent(event, data, options);
  }

  sendUpdatePlayersEvent(): void {
    this.#gameInfo.game.sendUpdatePlayersEvent();
  }

  *waitForActivePlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.#gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this.#isTimePaused()) {
            return;
          }

          if (this.#validate(data, options?.validate)) {
            resolve(data);
          }
        },
        this.#turnController.activePlayerIndex,
      );
    };
  }

  waitForActivePlayerSocketEvents<Event extends GameClientEvent<Game>>(
    events: Event[],
    options?: WaitForSocketEventsOptions<Game, Event>,
  ): EffectGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
    const server = this;

    return this.entity.race(
      events.map(function* (event): EntityGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
        return {
          event,
          data: yield* server.waitForActivePlayerSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          }),
        };
      }),
    );
  }

  *waitForOwnSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EntityGenerator<GameClientEventData<Game, Event>> {
    return yield* this.waitForPlayerSocketEvent(event, {
      ...options,
      playerIndex: this.#player.index,
    });
  }

  *waitForPlayerSettingChange(playerIndex: number): EntityGenerator<SettingsChangeEvent<Game>> {
    const data = yield* this.waitForPlayerSocketEvent(CommonGameClientEvent.CHANGE_SETTING, {
      playerIndex,
    });

    return this.#getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForPlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this.#gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this.#isTimePaused()) {
            return;
          }

          if (this.#validate(data, options?.validate)) {
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
    const server = this;

    return this.entity.race(
      events.map(function* (event): EntityGenerator<WaitForPlayerSocketEventsResult<Game, Event>> {
        return {
          event,
          data: yield* server.waitForPlayerSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          }),
        };
      }),
    );
  }

  *waitForSettingChange(): EntityGenerator<SettingsChangeEvent<Game>> {
    const { data, playerIndex } = yield* this.waitForSocketEvent(CommonGameClientEvent.CHANGE_SETTING);

    return this.#getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<WaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      return this.#gameInfo.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this.#isTimePaused()) {
          return;
        }

        if (this.#validate(data, options?.validate)) {
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
    const server = this;

    return this.entity.race(
      events.map(function* (event): EntityGenerator<WaitForSocketEventsResult<Game, Event>> {
        return {
          event,
          ...(yield* server.waitForSocketEvent<Event>(event, {
            ...options,
            validate: (data) => options?.validate?.[event]?.(data) ?? true,
          })),
        };
      }),
    );
  }
}
