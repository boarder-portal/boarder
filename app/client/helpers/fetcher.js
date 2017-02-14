import { parseJSON } from 'dwayne';
import Ajaxer from 'ajaxer';
import Promise from 'el-promise';
import { endpoints } from '../../config/constants.json';

Ajaxer.usePromise(Promise);

const baseURL = endpoints.base;
const fetcher = new Ajaxer({
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

export { baseURL, fetcher };
