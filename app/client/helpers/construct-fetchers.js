import { D } from 'dwayne';

function constructFetchers(fetcher, paths) {
  return D(paths).map(({ base, method }) => fetcher.instance({
    url: base,
    method
  })).$;
}

export { constructFetchers };
