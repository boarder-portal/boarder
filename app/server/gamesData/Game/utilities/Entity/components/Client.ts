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
  readonly #getSocketAddressCallback?: ClientOptions['getSocketAddress'];

  readonly #gameInfo = this.entity.obtainComponent(GameInfo<Game, E>);

  #socket: GameClientSocket<Game> | null = null;

  constructor(options?: ClientOptions) {
    super();

    this.#getSocketAddressCallback = options?.getSocketAddress;
  }

  onInit(): void {
    super.onInit();

    this.entity.obtainComponent(GameInfo);

    this.#socket = io(this.#getSocketAddress(), {
      forceNew: true,
    });
  }

  onDestroy(): void {
    super.onDestroy();

    this.#socket?.disconnect();
  }

  #getSocket(): GameClientSocket<Game> {
    if (!this.#socket) {
      throw new Error('No connected socket');
    }

    return this.#socket;
  }

  #getSocketAddress(): string {
    return this.#getSocketAddressCallback?.() ?? this.#gameInfo.serverAddress;
  }

  #listenSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
    listener: GameServerEventListener<Game, Event>,
  ): () => void {
    const socket = this.#getSocket();

    socket.on(event, listener as any);

    return () => {
      socket.off(event, listener as any);
    };
  }

  sendSocketEvent<Event extends GameClientDatalessEvent<Game>>(event: Event, data?: undefined): void;
  sendSocketEvent<Event extends GameClientEvent<Game>>(event: Event, data: GameClientEventData<Game, Event>): void;
  sendSocketEvent<Event extends GameClientEvent<Game>>(event: Event, data: GameClientEventData<Game, Event>): void {
    // @ts-ignore
    this.#getSocket().emit(event, data);
  }

  *waitForGameData(): EntityGenerator<GameData<Game>> {
    return (yield* this.waitForSocketEvent(CommonGameServerEvent.GET_DATA)) as GameData<Game>;
  }

  *waitForGameInfo(): EntityGenerator<GameInfoModel<Game>> {
    return yield* this.waitForSocketEvent(CommonGameServerEvent.GET_INFO);
  }

  *waitForSocketEvent<Event extends GameServerEvent<Game>>(
    event: Event,
  ): EffectGenerator<GameServerEventData<Game, Event>> {
    return yield (resolve) => {
      return this.#listenSocketEvent(event, resolve);
    };
  }
}
