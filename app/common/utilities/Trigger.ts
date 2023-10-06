export type TriggerCallback<Value> = (value: Value) => unknown;

export type Unsubscribe = () => void;

export default class Trigger<Value = void> {
  #callbacks = new Set<TriggerCallback<Value>>();

  activate(value: Value): void {
    const startingCallbacks = new Set(this.#callbacks);

    for (const callback of this.#callbacks) {
      if (startingCallbacks.has(callback)) {
        callback(value);
      }
    }
  }

  subscribe(callback: TriggerCallback<Value>): Unsubscribe {
    this.#callbacks.add(callback);

    return () => {
      this.#callbacks.delete(callback);
    };
  }
}
