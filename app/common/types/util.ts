export type OneKey<T> = {
  [P in keyof T]: Record<P, T[P]> & Record<Exclude<keyof T, P>, undefined>;
}[keyof T];
