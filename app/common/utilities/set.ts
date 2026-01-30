export function addElementsToSet<T>(set: Set<T>, elements: Iterable<T>): void {
  for (const element of elements) {
    set.add(element);
  }
}
