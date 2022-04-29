export default function isDefined<T>(value: T): value is Exclude<T, null | undefined> {
  return value != null;
}
