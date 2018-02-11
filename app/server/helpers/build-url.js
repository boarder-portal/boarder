const { stringify } = require('querystring');
const _ = require('lodash');

exports.buildURL = ({
  protocol = 'http',
  host = 'boarder.tk',
  path = '/',
  query = {}
} = {}) => {
  let search = '';

  if (!_.isEmpty(query)) {
    search = `?${stringify(query)}`;
  }

  return `${protocol}://${host + path + search}`;
};
