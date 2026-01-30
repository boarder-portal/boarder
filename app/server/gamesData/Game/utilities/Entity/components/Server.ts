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
  private readonly _gameInfo = this.entity.obtainComponent(GameInfo<Game, E>);
  private readonly _time = this.entity.obtainComponent(Time);

  private readonly _optionsPlayer?: Player;
  private readonly _optionsTurnController?: TurnController;

  constructor(options?: ServerOptions) {
    super();

    this._optionsPlayer = options?.player;
    this._optionsTurnController = options?.turnController;
  }

  private get _player(): Player {
    return this._optionsPlayer ?? this.entity.getClosestComponent(Player);
  }

  private get _turnController(): TurnController {
    return this._optionsTurnController ?? this.entity.getClosestComponent(TurnController);
  }

  private _getSettingChangeEvent(playerIndex: number, event: ChangeSettingEvent<Game>): SettingsChangeEvent<Game> {
    return {
      playerIndex,
      settings: this._gameInfo.getPlayerSettings(playerIndex),
      ...event,
    };
  }

  private _isTimePaused(): boolean {
    return this._time.paused;
  }

  private _validate<Data>(data: Data, validator?: (data: Data) => boolean): boolean {
    if (!validator) {
      return true;
    }

    try {
      return Boolean(validator(data));
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
      playerIndex: this._player.index,
    });
  }

  *listenForPlayerSocketEvent<Event extends GameClientEvent<Game>, Result = void>(
    event: Event,
    callback: (data: GameClientEventData<Game, Event>) => Result | void,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<Result> {
    return yield (resolve, reject) => {
      return this._gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this._isTimePaused()) {
            return;
          }

          try {
            if (this._validate(data, options?.validate)) {
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
      return this._gameInfo.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this._isTimePaused()) {
          return;
        }

        try {
          if (this._validate(data, options?.validate)) {
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
      callback(this._getSettingChangeEvent(playerIndex, data as any)),
    );
  }

  ping(): void {
    this.sendSocketEvent(CommonGameServerEvent.PING, now());
  }

  *pingIndefinitely(interval: number): EntityGenerator {
    const server = this;

    yield* this._time.repeatTask(interval, function* () {
      server.ping();
    });
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
    this._gameInfo.game.sendSocketEvent(event, data, options);
  }

  sendUpdatePlayersEvent(): void {
    this._gameInfo.game.sendUpdatePlayersEvent();
  }

  *waitForActivePlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this._gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this._isTimePaused()) {
            return;
          }

          if (this._validate(data, options?.validate)) {
            resolve(data);
          }
        },
        this._turnController.activePlayerIndex,
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
      playerIndex: this._player.index,
    });
  }

  *waitForPlayerSettingChange(playerIndex: number): EntityGenerator<SettingsChangeEvent<Game>> {
    const data = yield* this.waitForPlayerSocketEvent(CommonGameClientEvent.CHANGE_SETTING, {
      playerIndex,
    });

    return this._getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForPlayerSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options: WaitForPlayerSocketEventOptions<Game, Event>,
  ): EffectGenerator<GameClientEventData<Game, Event>> {
    return yield (resolve) => {
      return this._gameInfo.game.listenSocketEvent(
        event,
        (data) => {
          if (this._isTimePaused()) {
            return;
          }

          if (this._validate(data, options?.validate)) {
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

    return this._getSettingChangeEvent(playerIndex, data as any);
  }

  *waitForSocketEvent<Event extends GameClientEvent<Game>>(
    event: Event,
    options?: WaitForSocketEventOptions<Game, Event>,
  ): EffectGenerator<WaitForSocketEventResult<Game, Event>> {
    return yield (resolve) => {
      return this._gameInfo.game.listenSocketEvent(event, (data, playerIndex) => {
        if (this._isTimePaused()) {
          return;
        }

        if (this._validate(data, options?.validate)) {
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
