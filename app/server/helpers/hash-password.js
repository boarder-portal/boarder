const crypto = require('crypto');
const { secret } = require('../../config/config.json');

module.exports = (password) => (
  crypto
    .createHmac('sha256', secret)
    .update(password)
    .digest('hex')
);
