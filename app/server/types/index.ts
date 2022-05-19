import { Socket } from 'socket.io';

import { IUser } from 'common/types';

export interface ISession {
  user?: IUser;
  destroy?(): void;
}

export interface IGameEvent<Data = undefined> {
  socket: Socket;
  data: Data;
}

declare module 'socket.io' {
  interface Socket {
    user: IUser | null;
  }
}
