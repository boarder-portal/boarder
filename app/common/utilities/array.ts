export function moveElement(array: unknown[], from: number, to: number): void {
  array.splice(to, 0, ...array.splice(from, 1));
}
