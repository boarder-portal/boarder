import _ from 'lodash';

import { BoarderClientError } from '../helpers';
import { errors as configErrors } from '../../shared/constants';

const errors = Object.create(null);

_.forEach(configErrors, (err, name) => {
  if (typeof err === 'string') {
    errors[name] = new BoarderClientError(err);
  } else {
    errors[name] = new BoarderClientError(err.message, err.status);
  }
});

export default async (ctx, next) => {
  ctx.reject = (err) => {
    ctx.set('Custom-Error', 'true');

    throw errors[err];
  };

  await next();
};
