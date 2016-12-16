import { D } from 'dwayne';

class Emitter {
  _listeners = {};

  on(event, listener) {
    const listeners = this._listeners[event] = this._listeners[event] || D([]);
    const index = listeners.length;

    listeners.push(listener);

    return () => listeners.splice(index, 1);
  }

  emit(event, data) {
    const e = D({}).assign({ type: event }, data).$;

    D(this._listeners[event]).forEach((listener) => listener(e));
  }
}

export { Emitter };
