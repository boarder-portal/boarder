import _ from 'lodash';
import axios from 'axios';
import { endpoints } from '../../config/constants.json';
import { parseJSON } from './parse-json';
import { ALERTS } from '../constants';
import { addAlert } from '../actions';

export function constructFetchers(path) {
  const {
    [path]: {
      base,
      ...paths
    }
  } = endpoints;
  const fetcherInstance = axios.create({
    baseURL: endpoints.base + base,
    transformResponse: null,
    validateStatus: null
  });

  fetcherInstance.interceptors.response.use((res) => {
    const { status } = res;

    if (status === 200 || status === 304) {
      return res;
    }

    const error = new Error('Wrong status');

    error.response = res;
    error.type = 'STATUS_ERROR';

    throw error;
  });

  fetcherInstance.interceptors.response.use((res) => {
    res.json = parseJSON(res.request.response, true);

    return res;
  });

  fetcherInstance.interceptors.response.use(null, (err) => {
    if (err.response && err.response.headers['Custom-Error'] !== 'true') {
      console.log(err.response);

      addAlert(ALERTS.AJAX_ERROR);
    }

    throw err;
  });

  return _.mapValues(paths, ({ base, method }) => (config) => (
    fetcherInstance.request({
      url: base,
      method,
      ...config
    })
  ));
}
