import { parseJSON, Fetch } from 'dwayne';
import { Alert } from '../helpers';
import { AJAX_ERROR_ALERT_DURATION } from '../constants';
import AJAXErrorAlert from '../views/alerts/ajax-error.pug';
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
  })
  .after((err, res) => {
    console.log(res);

    new Alert(AJAXErrorAlert, AJAX_ERROR_ALERT_DURATION, 'error');

    throw err;
  });
