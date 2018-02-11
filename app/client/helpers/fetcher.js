import Ajaxer from 'ajaxer';

import { parseJSON } from './parse-json';
import { ALERTS } from '../constants';
import { addAlert } from '../actions';
import { endpoints } from '../../config/constants.json';

Ajaxer.usePromise(Promise);

const baseURL = endpoints.base;
const fetcher = new Ajaxer({
  baseURL
});

fetcher
  .after((res) => {
    const { status } = res;

    if (status === 200 || status === 304) {
      return;
    }

    const error = new Error('Wrong status');

    error.response = res;
    error.type = 'STATUS_ERROR';

    throw error;
  })
  .after((res) => {
    res.json = parseJSON(res.data, true);
  })
  .after((err, res) => {
    if (res.headers['Custom-Error'] !== 'true') {
      console.log(res);

      addAlert(ALERTS.AJAX_ERROR);
    }

    throw err;
  });

export { baseURL, fetcher };
