import session from 'express-session';
import { Socket } from 'socket.io';

import sessionSettings from 'server/sessionSettings';

const ioSessionMiddleware = (socket: Socket, next: () => void): void => {
  session(sessionSettings)(socket.request as any, {} as any, () => {
    socket.user = (socket.request as any).session.user || null;

    next();
  });
};

export default ioSessionMiddleware;
