export function now(): number {
  const perf = SERVER ? (require('node:perf_hooks') as typeof import('node:perf_hooks')).performance : performance;

  return perf.timeOrigin + perf.now();
}
