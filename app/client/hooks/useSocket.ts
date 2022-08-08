import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { ReservedOrUserEventNames } from '@socket.io/component-emitter';
import forEach from 'lodash/forEach';
import mapValues from 'lodash/mapValues';
import { ReservedOrUserListener } from 'socket.io/dist/typed-events';

import { TSocketListenEventMap, TClientSocket } from 'common/types/socket';

import { DisconnectDescription } from 'socket.io-client/build/esm/socket';

interface SocketReservedEvents {
  connect: () => void;
  // eslint-disable-next-line camelcase
  connect_error: (err: Error) => void;
  disconnect: (reason: Socket.DisconnectReason, description?: DisconnectDescription) => void;
}

export default function useSocket<ClientEvents = Record<never, never>, ServerEvents = Record<never, never>>(
  socketOrUrl: TClientSocket<ClientEvents, ServerEvents>,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<
      SocketReservedEvents,
      TSocketListenEventMap<ServerEvents>
    >]: ReservedOrUserListener<SocketReservedEvents, TSocketListenEventMap<ServerEvents>, Event>;
  }>,
): TClientSocket<ClientEvents, ServerEvents>;
export default function useSocket<ClientEvents = Record<never, never>, ServerEvents = Record<never, never>>(
  socketOrUrl: string,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<
      SocketReservedEvents,
      TSocketListenEventMap<ServerEvents>
    >]: ReservedOrUserListener<SocketReservedEvents, TSocketListenEventMap<ServerEvents>, Event>;
  }>,
): TClientSocket<ClientEvents, ServerEvents> | null;

export default function useSocket<ClientEvents = Record<never, never>, ServerEvents = Record<never, never>>(
  socketOrUrl: string | TClientSocket<ClientEvents, ServerEvents>,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<
      SocketReservedEvents,
      TSocketListenEventMap<ServerEvents>
    >]: ReservedOrUserListener<SocketReservedEvents, TSocketListenEventMap<ServerEvents>, Event>;
  }>,
): TClientSocket<ClientEvents, ServerEvents> | null {
  const socketRef = useRef<TClientSocket<ClientEvents, ServerEvents> | null>(
    typeof socketOrUrl === 'object' ? socketOrUrl : null,
  );
  const eventMapRef = useRef(eventMap);

  eventMapRef.current = eventMap;

  useEffect(() => {
    const socket = (socketRef.current =
      typeof socketOrUrl === 'string' ? io(socketOrUrl, { forceNew: true }) : socketOrUrl);

    const listeners = mapValues(eventMapRef.current, (_, event) => {
      return (...args: unknown[]) => (eventMapRef.current as any)[event]?.(...args);
    });

    forEach(listeners, (listener, event) => {
      if (listener) {
        socket.on(event as any, listener);
      }
    });

    return () => {
      if (typeof socketOrUrl === 'string') {
        socket.disconnect();
      } else {
        forEach(listeners, (listener, event) => {
          if (listener) {
            socket.off(event as any, listener);
          }
        });
      }
    };
  }, [socketOrUrl]);

  return socketRef.current;
}
