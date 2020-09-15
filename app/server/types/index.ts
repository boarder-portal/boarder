import { Socket } from 'socket.io';

import { IUser } from 'common/types';

export interface ISession {
  user?: IUser;
}

export interface IAuthSocket extends Socket {
  user: IUser | null;
}
