import { User } from 'common/types';

declare module 'socket.io' {
  interface Socket {
    user: User | null;
    playerSettings: unknown;
  }
}
