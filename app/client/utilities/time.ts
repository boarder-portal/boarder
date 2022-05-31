export function now(): number {
  return performance.timeOrigin + performance.now();
}
