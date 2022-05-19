export default function hasOwnProperty<T, K extends string>(object: T, key: K): object is T & Record<K, unknown> {
  return {}.hasOwnProperty.call(object, key);
}
