const D = require('dwayne');

exports.buildURL = ({
  protocol = 'http',
  host = 'boarder.tk',
  path = '/',
  query = {}
} = {}) => {
  let search = '';

  if (D(query).count) {
    search += '?';
    search += D(query)
      .object((query, value, key) => (
        query.push(`${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`)
      ), [])
      .join('&');
  }

  return `${ protocol }://${ host + path + search }`;
};
