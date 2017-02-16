import _ from 'lodash';

class Emitter {
  _listeners = {};

  on(event, listener) {
    const listeners = this._listeners[event] = this._listeners[event] || [];
    const index = listeners.length;

    listeners.push(listener);

    return () => listeners.splice(index, 1);
  }

  emit(event, data) {
    const e = _.assign({}, { type: event }, data);

    _.forEach(this._listeners[event], (listener) => {
      listener(e);
    });
  }
}

export { Emitter };
