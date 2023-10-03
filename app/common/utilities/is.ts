export function isDefined<T>(value: T): value is Exclude<T, null | undefined> {
  return value != null;
}

export const isArray: (value: unknown) => value is unknown[] = Array.isArray;
