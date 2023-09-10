import { Namespace as IoNamespace, Socket as IoServerSocket } from 'socket.io';
import { Socket as IoClientSocket } from 'socket.io-client';

import { GameClientEventMap, GameServerEventMap, GameType } from 'common/types/game';

export type SocketEventArgs<Map, Event extends keyof Map> = Map[Event] extends undefined ? [] : [Map[Event]];

export type SocketEmitEventMap<Map> = {
  [Event in keyof Map]: (...args: SocketEventArgs<Map, Event>) => void;
};

export type SocketListenEventMap<Map> = {
  [Event in keyof Map]: (data: Map[Event]) => void;
};

export type ClientSocket<ClientEvents, ServerEvents> = IoClientSocket<
  SocketListenEventMap<ServerEvents>,
  SocketEmitEventMap<ClientEvents>
>;

export type GameClientSocket<Game extends GameType> = ClientSocket<GameClientEventMap<Game>, GameServerEventMap<Game>>;

export type ServerSocket<ClientEvents, ServerEvents> = IoServerSocket<
  SocketListenEventMap<ClientEvents>,
  SocketEmitEventMap<ServerEvents>
>;

export type GameServerSocket<Game extends GameType> = ServerSocket<GameClientEventMap<Game>, GameServerEventMap<Game>>;

export type Namespace<ClientEvents, ServerEvents> = IoNamespace<
  SocketListenEventMap<ClientEvents>,
  SocketEmitEventMap<ServerEvents>
>;

export type GameNamespace<Game extends GameType> = Namespace<GameClientEventMap<Game>, GameServerEventMap<Game>>;
