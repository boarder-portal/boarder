import _ from 'lodash';

export class Emitter {
  _listeners = {};

  on(event, listener) {
    const listeners = this._listeners[event] = this._listeners[event] || [];
    const index = listeners.length;

    listeners.push(listener);

    return () => listeners.splice(index, 1);
  }

  emit(event, data) {
    _.forEach(this._listeners[event], (listener) => {
      listener(data);
    });
  }
}
