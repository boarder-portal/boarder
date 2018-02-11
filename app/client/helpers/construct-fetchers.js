import _ from 'lodash';
import { fetcher, baseURL } from './fetcher';
import { endpoints } from '../../config/constants.json';

export function constructFetchers(path) {
  const {
    [path]: {
      base,
      ...paths
    }
  } = endpoints;
  const fetcherInstance = fetcher.instance({
    baseURL: baseURL + base
  });

  return _.mapValues(paths, ({ base, method }) => (
    fetcherInstance.instance({
      url: base,
      method
    })
  ));
}
