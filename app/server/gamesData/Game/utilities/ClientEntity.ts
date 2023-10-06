import io from 'socket.io-client';

import { PORT } from 'server/constants';

import { CommonGameServerEvent } from 'common/types';
import {
  GameClientDatalessEvent,
  GameClientEvent,
  GameClientEventData,
  GameData,
  GameInfo,
  GameServerEvent,
  GameServerEventData,
  GameServerEventListener,
  GameType,
} from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import { EffectGenerator, EntityGenerator } from 'common/utilities/Entity/Entity';
import AbstractGameEntity from 'server/gamesData/Game/utilities/AbstractGameEntity';

export default abstract class ClientEntity<Game extends GameType, Result = unknown> extends AbstractGameEntity<
  Game,
  Result
> {
  #socket: GameClientSocket<Game> | null = null;

  #getSocket(): GameClientSocket<Game> {
    if (!this.#socket) {
      throw new Error('No connected socket');
    }

    return this.#socket;
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

  *afterLifecycle(): EntityGenerator {
    this.#socket?.disconnect();

    yield* super.afterLifecycle();
  }

  *beforeLifecycle(): EntityGenerator {
    yield* super.beforeLifecycle();

    this.#socket = io(this.getSocketAddress(), {
      forceNew: true,
    });
  }

  getSocketAddress(): string {
    return `http://localhost:${PORT}${this.getGame().io.name}`;
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

  *waitForGameInfo(): EntityGenerator<GameInfo<Game>> {
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
