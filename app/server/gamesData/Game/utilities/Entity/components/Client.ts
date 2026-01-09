import io from 'socket.io-client';

import { CommonGameServerEvent } from 'common/types';
import {
  GameClientDatalessEvent,
  GameClientEvent,
  GameClientEventData,
  GameData,
  GameInfo as GameInfoModel,
  GameServerEvent,
  GameServerEventData,
  GameServerEventListener,
  GameType,
} from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import Entity, { AnyEntity, EffectGenerator, EntityGenerator } from 'server/gamesData/Game/utilities/Entity/Entity';
import EntityComponent from 'server/gamesData/Game/utilities/Entity/EntityComponent';
import GameInfo from 'server/gamesData/Game/utilities/Entity/components/GameInfo';

export interface ClientOptions {
  getSocketAddress?(): string;
}

export default class Client<Game extends GameType, E extends AnyEntity = Entity> extends EntityComponent<E> {
  private readonly _getSocketAddressCallback?: ClientOptions['getSocketAddress'];

  private readonly _gameInfo = this.entity.obtainComponent(GameInfo<Game, E>);

  private _socket: GameClientSocket<Game> | null = null;

  constructor(options?: ClientOptions) {
    super();

    this._getSocketAddressCallback = options?.getSocketAddress;
  }

  onInit(): void {
    super.onInit();

    this.entity.obtainComponent(GameInfo);

    this._socket = io(this._getSocketAddress(), {
      forceNew: true,
    });
  }

  onDestroy(): void {
    super.onDestroy();

    this._socket?.disconnect();
  }

  private _getSocket(): GameClientSocket<Game> {
    if (!this._socket) {
      throw new Error('No connected socket');
    }

    return this._socket;
  }

  private _getSocketAddress(): string {
    return this._getSocketAddressCallback?.() ?? this._gameInfo.serverAddress;
  }

  private _listenSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
    listener: GameServerEventListener<Game, Event>,
  ): () => void {
    const socket = this._getSocket();

    socket.on(event, listener as any);

    return () => {
      socket.off(event, listener as any);
    };
  }

  sendSocketEvent<Event extends GameClientDatalessEvent<Game>>(event: Event, data?: undefined): void;
  sendSocketEvent<Event extends GameClientEvent<Game>>(event: Event, data: GameClientEventData<Game, Event>): void;
  sendSocketEvent<Event extends GameClientEvent<Game>>(event: Event, data: GameClientEventData<Game, Event>): void {
    // @ts-ignore
    this._getSocket().emit(event, data);
  }

  *waitForGameData(): EntityGenerator<GameData<Game>> {
    return (yield* this.waitForSocketEvent(CommonGameServerEvent.GET_DATA)) as GameData<Game>;
  }

  *waitForGameInfo(): EntityGenerator<GameInfoModel<Game>> {
    return JSON.parse(yield* this.waitForSocketEvent(CommonGameServerEvent.GET_INFO));
  }

  *waitForSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
  ): EffectGenerator<GameServerEventData<Game, Event>> {
    return yield (resolve) => {
      return this._listenSocketEvent(event, resolve);
    };
  }
}
