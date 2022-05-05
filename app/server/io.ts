import socketIO from 'socket.io';

import httpServer from 'server/httpServer';

const io = socketIO(httpServer, { serveClient: false });

export default io;
