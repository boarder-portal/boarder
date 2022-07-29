import io from 'socket.io-client';

import { PORT } from 'server/constants';

import {
  EGame,
  IGameData,
  TGameClientDatalessEvent,
  TGameClientEvent,
  TGameClientEventData,
  TGameInfo,
  TGameServerEvent,
  TGameServerEventData,
  TGameServerEventListener,
} from 'common/types/game';
import { TGameClientSocket } from 'common/types/socket';
import { ECommonGameServerEvent } from 'common/types';

import Entity, { TEffectGenerator, TGenerator } from 'server/gamesData/Game/utilities/Entity';

export default abstract class ClientEntity<Game extends EGame, Result = unknown> extends Entity<Game, Result> {
  #socket: TGameClientSocket<Game> | null = null;

  #getSocket(): TGameClientSocket<Game> {
    if (!this.#socket) {
      throw new Error('No connected socket');
    }

    return this.#socket;
  }

  #listenSocketEvent<Event extends TGameServerEvent<Game>>(
    event: Event,
    listener: TGameServerEventListener<Game, Event>,
  ): () => void {
    const socket = this.#getSocket();

    socket.on(event, listener as any);

    return () => {
      socket.off(event, listener as any);
    };
  }

  *afterLifecycle(): TGenerator {
    this.#socket?.disconnect();
  }

  *beforeLifecycle(): TGenerator {
    yield* super.beforeLifecycle();

    this.#socket = io(this.getSocketAddress(), {
      forceNew: true,
    });
  }

  getSocketAddress(): string {
    return `http://localhost:${PORT}${this.context.game.io.name}`;
  }

  sendSocketEvent<Event extends TGameClientDatalessEvent<Game>>(event: Event, data?: undefined): void;
  sendSocketEvent<Event extends TGameClientEvent<Game>>(event: Event, data: TGameClientEventData<Game, Event>): void;
  sendSocketEvent<Event extends TGameClientEvent<Game>>(event: Event, data: TGameClientEventData<Game, Event>): void {
    // @ts-ignore
    this.#getSocket().emit(event, data);
  }

  *waitForGameData(): TGenerator<IGameData<Game>> {
    return (yield* this.waitForSocketEvent(ECommonGameServerEvent.GET_DATA)) as IGameData<Game>;
  }

  *waitForGameInfo(): TGenerator<TGameInfo<Game>> {
    return yield* this.waitForSocketEvent(ECommonGameServerEvent.GET_INFO);
  }

  *waitForSocketEvent<Event extends TGameServerEvent<Game>>(
    event: Event,
  ): TEffectGenerator<TGameServerEventData<Game, Event>> {
    return yield (resolve) => {
      return this.#listenSocketEvent(event, resolve);
    };
  }
}
