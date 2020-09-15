import session from 'express-session';

import { IAuthSocket } from 'server/types';

import sessionSettings from 'server/sessionSettings';

const ioSessionMiddleware = (socket: IAuthSocket, next: () => void) => {
  session(sessionSettings)(socket.request, {} as any, () => {
    socket.user = socket.request.session.user || null;

    next();
  });
};

export default ioSessionMiddleware;
