import { Socket } from 'socket.io';

import { IUser } from 'common/types';

export interface ISession {
  user?: IUser;
  destroy?(): void;
}

export interface IAuthSocket extends Socket {
  user: IUser | null;
}

export interface IGameEvent<Data = undefined> {
  socket: IAuthSocket;
  data: Data;
}
