import { Namespace } from 'socket.io';

import ioInstance from 'server/io';

export default function removeNamespace(namespace: Namespace): void {
  namespace.removeAllListeners();
  namespace.disconnectSockets(true);

  ioInstance._nsps.delete(namespace.name);
}
