import { Server } from 'socket.io';

import { server } from 'server/server';

const io = new Server(server, { serveClient: false });

export default io;
