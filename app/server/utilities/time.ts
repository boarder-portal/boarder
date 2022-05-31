import { performance } from 'node:perf_hooks';

export function now(): number {
  return performance.timeOrigin + performance.now();
}
