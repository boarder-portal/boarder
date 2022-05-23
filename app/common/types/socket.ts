import { Socket as ClientSocket } from 'socket.io-client';
import { Namespace, Socket as ServerSocket } from 'socket.io';

import { EGame, TGameClientEventMap, TGameServerEventMap } from 'common/types/game';

export type TSocketEventArgs<Map, Event extends keyof Map> = Map[Event] extends undefined ? [] : [Map[Event]];

export type TSocketEmitEventMap<Map> = {
  [Event in keyof Map]: (...args: TSocketEventArgs<Map, Event>) => void;
};

export type TSocketListenEventMap<Map> = {
  [Event in keyof Map]: (data: Map[Event]) => void;
};

export type TClientSocket<ClientEvents, ServerEvents> = ClientSocket<
  TSocketListenEventMap<ServerEvents>,
  TSocketEmitEventMap<ClientEvents>
>;

export type TGameClientSocket<Game extends EGame> = TClientSocket<TGameClientEventMap<Game>, TGameServerEventMap<Game>>;

export type TServerSocket<ClientEvents, ServerEvents> = ServerSocket<
  TSocketListenEventMap<ClientEvents>,
  TSocketEmitEventMap<ServerEvents>
>;

export type TGameServerSocket<Game extends EGame> = TServerSocket<TGameClientEventMap<Game>, TGameServerEventMap<Game>>;

export type TNamespace<ClientEvents, ServerEvents> = Namespace<
  TSocketListenEventMap<ClientEvents>,
  TSocketEmitEventMap<ServerEvents>
>;

export type TGameNamespace<Game extends EGame> = TNamespace<TGameClientEventMap<Game>, TGameServerEventMap<Game>>;
