const _ = require('lodash');
const {
  games
} = require('../config/constants.json');

exports.gamesList = _(games)
  .omit('global')
  .omitBy(({ dev }) => {
    if (process.env.NODE_ENV === 'production' && dev) {
      return true;
    }
  })
  .keys()
  .value();
