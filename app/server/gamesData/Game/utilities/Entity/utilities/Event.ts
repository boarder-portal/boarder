export type EventCallback<Value> = (value: Value) => unknown;

export type Unsubscribe = () => void;

export default class Event<Value = void> {
  readonly #callbacks = new Set<EventCallback<Value>>();

  dispatch(value: Value): void {
    const startingCallbacks = new Set(this.#callbacks);

    for (const callback of this.#callbacks) {
      if (startingCallbacks.has(callback)) {
        callback(value);
      }
    }
  }

  subscribe(callback: EventCallback<Value>): Unsubscribe {
    this.#callbacks.add(callback);

    return () => {
      this.#callbacks.delete(callback);
    };
  }
}
