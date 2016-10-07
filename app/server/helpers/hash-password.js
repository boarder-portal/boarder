const crypto = require('crypto');
const { secret } = require('../../config/config.json');

exports.hashPassword = (password) => (
  crypto
    .createHmac('sha256', secret)
    .update(password)
    .digest('hex')
);
