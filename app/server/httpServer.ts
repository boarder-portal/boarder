import http from 'http';

import app from 'server/expressApp';

const httpServer = http.createServer(app);

export default httpServer;
