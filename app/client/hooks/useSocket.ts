import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { ReservedOrUserEventNames } from '@socket.io/component-emitter';
import forEach from 'lodash/forEach';
import { ReservedOrUserListener } from 'socket.io/dist/typed-events';

import { TSocketEventMap } from 'common/types/socket';

import { DisconnectDescription } from 'socket.io-client/build/esm/socket';

interface SocketReservedEvents {
  connect: () => void;
  // eslint-disable-next-line camelcase
  connect_error: (err: Error) => void;
  disconnect: (reason: Socket.DisconnectReason, description?: DisconnectDescription) => void;
}

export default function useSocket<ListenEvents = Record<never, never>, EmitEvents = ListenEvents>(
  socketOrUrl: Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>>,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<SocketReservedEvents, TSocketEventMap<ListenEvents>>]: ReservedOrUserListener<
      SocketReservedEvents,
      TSocketEventMap<ListenEvents>,
      Event
    >;
  }>,
): Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>>;
export default function useSocket<ListenEvents = Record<never, never>, EmitEvents = ListenEvents>(
  socketOrUrl: string,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<SocketReservedEvents, TSocketEventMap<ListenEvents>>]: ReservedOrUserListener<
      SocketReservedEvents,
      TSocketEventMap<ListenEvents>,
      Event
    >;
  }>,
): Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>> | null;

export default function useSocket<ListenEvents = Record<never, never>, EmitEvents = ListenEvents>(
  socketOrUrl: string | Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>>,
  eventMap?: Partial<{
    [Event in ReservedOrUserEventNames<SocketReservedEvents, TSocketEventMap<ListenEvents>>]: ReservedOrUserListener<
      SocketReservedEvents,
      TSocketEventMap<ListenEvents>,
      Event
    >;
  }>,
): Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>> | null {
  const socketRef = useRef<Socket<TSocketEventMap<ListenEvents>, TSocketEventMap<EmitEvents>> | null>(
    typeof socketOrUrl === 'object' ? socketOrUrl : null,
  );
  const eventMapRef = useRef(eventMap);

  useEffect(() => {
    const socket = (socketRef.current = typeof socketOrUrl === 'string' ? io(socketOrUrl) : socketOrUrl);
    const eventMap = eventMapRef.current;

    forEach(eventMap, (listener: any, event) => {
      if (listener) {
        socket.on(event as any, listener);
      }
    });

    return () => {
      if (typeof socketOrUrl === 'string') {
        socket.disconnect();
      } else {
        forEach(eventMap, (listener: any, event) => {
          if (listener) {
            socket.off(event as any, listener);
          }
        });
      }
    };
  }, [socketOrUrl]);

  return socketRef.current;
}
