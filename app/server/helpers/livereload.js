import socketIOEmitter from 'socket.io-emitter';

import { createClient } from './redis';
import config from '../config';
import { LIVERELOAD_NSP } from '../../shared/constants';

const io = socketIOEmitter(createClient(), config.redis);

export function emit(...args) {
  io.of(LIVERELOAD_NSP).emit(...args);
}
