import constructFetchers from '../helpers/construct-fetchers';
import { fetcher, baseURL } from './';
import { endpoints } from '../../config/constants.json';

const {
  users: {
    base,
    ...paths
  }
} = endpoints;

export const usersFetcher = fetcher.instance({
  baseURL: baseURL + base
});

export const fetch = constructFetchers(usersFetcher, paths);
