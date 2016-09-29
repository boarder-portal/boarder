import { D } from 'dwayne';

export function constructFetchers(fetcher, paths) {
  return D(paths).map(({ base, method }) => fetcher.instance({
    url: base,
    method
  })).$;
}
