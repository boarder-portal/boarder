const generateUID = require('uid');

exports.generateUID = (length = 7, forCollection = {}) => {
  let uid;

  /* eslint no-empty: 0 */
  while (forCollection[uid = generateUID(length)]) {}

  return uid;
};
