import crypto from 'crypto';

import config from '../config';

export default (password) => (
  crypto
    .createHmac('sha256', config.secret)
    .update(password)
    .digest('hex')
);
