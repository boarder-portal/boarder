import { parseJSON, Fetch } from 'dwayne';
import { endpoints } from '../../config/constants.json';

export const baseURL = endpoints.base;
export const fetcher = new Fetch({
  baseURL
});

fetcher
  .after(({ status }) => {
    if (status === 200 || status === 304) {
      return;
    }

    const error = new Error('Wrong status');

    error.type = 'STATUS_ERROR';

    throw error;
  })
  .after((res) => {
    res.json = parseJSON(res.data, { dates: true }).$;
  });
