import socketIO from 'socket.io';

import httpServer from 'server/httpServer';

const io = socketIO(httpServer);

export default io;
