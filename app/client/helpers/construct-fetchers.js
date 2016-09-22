import { D } from 'dwayne';

export default (fetcher, paths) => D(paths).map(({ base, method }) => fetcher.instance({
  url: base,
  method
})).$;
