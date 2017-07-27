const _ = require('lodash');

const {
  BoarderClientError
} = require('../helpers');
const {
  errors: configErrors
} = require('../../config/constants.json');

const errors = Object.create(null);

_.forEach(configErrors, (err, name) => {
  if (typeof err === 'string') {
    errors[name] = new BoarderClientError(err);
  } else {
    errors[name] = new BoarderClientError(err.message, err.status);
  }
});

module.exports = async (ctx, next) => {
  ctx.reject = (err) => {
    ctx.set('Custom-Error', 'true');

    throw errors[err];
  };

  await next();
};
