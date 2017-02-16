const _ = require('lodash');

exports.buildURL = ({
  protocol = 'http',
  host = 'boarder.tk',
  path = '/',
  query = {}
} = {}) => {
  let search = '';

  if (!_.isEmpty(query)) {
    search += '?';
    search += _(query)
      .map((value, key) => (
        `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`
      ))
      .join('&');
  }

  return `${ protocol }://${ host + path + search }`;
};
