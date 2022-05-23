import { IUser } from 'common/types';

export interface ISession {
  user?: IUser;
  destroy?(): void;
}

declare module 'socket.io' {
  interface Socket {
    user: IUser | null;
  }
}
