import { Server } from 'socket.io';

import httpServer from 'server/httpServer';

const io = new Server(httpServer, { serveClient: false });

export default io;
