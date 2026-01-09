export type EventCallback<Value> = (value: Value) => unknown;

export type Unsubscribe = () => void;

export default class Event<Value = void> {
  private readonly _callbacks = new Set<EventCallback<Value>>();

  dispatch(value: Value): void {
    const startingCallbacks = new Set(this._callbacks);

    for (const callback of this._callbacks) {
      if (startingCallbacks.has(callback)) {
        callback(value);
      }
    }
  }

  subscribe(callback: EventCallback<Value>): Unsubscribe {
    this._callbacks.add(callback);

    return () => {
      this._callbacks.delete(callback);
    };
  }
}
