import generateUid from 'uid';

export function generateUID(length = 7, forCollection = {}) {
  let uid;

  /* eslint no-empty: 0 */
  while (forCollection[uid = generateUid(length)]) {}

  return uid;
}
