import { D } from 'dwayne';
import { fetcher, baseURL } from '../fetchers/base';
import { endpoints } from '../../config/constants.json';

function constructFetchers(path) {
  const {
    [path]: {
      base,
      ...paths
    }
  } = endpoints;
  const fetcherInstance = fetcher.instance({
    baseURL: baseURL + base
  });

  return D(paths).map(({ base, method }) => fetcherInstance.instance({
    url: base,
    method
  })).$;
}

export { constructFetchers };
