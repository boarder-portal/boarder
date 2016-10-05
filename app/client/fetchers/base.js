import { parseJSON, Fetch } from 'dwayne';
import { endpoints } from '../../config/constants.json';

export const baseURL = endpoints.base;

export const fetcher = new Fetch({
  baseURL
});

fetcher.after((res) => {
  res.json = parseJSON(res.data, { dates: true }).$;
});
