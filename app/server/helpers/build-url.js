import qs from 'querystring';
import _ from 'lodash';

export function buildURL({
  protocol = 'http',
  host = 'boarder.tk',
  path = '/',
  query = {}
} = {}) {
  let search = '';

  if (!_.isEmpty(query)) {
    search = `?${qs.stringify(query)}`;
  }

  return `${protocol}://${host + path + search}`;
}
