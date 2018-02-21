import _ from 'lodash';
import { games } from '../constants';

export const gamesList = _(games)
  .omit('global')
  .omitBy(({ dev }) => {
    if (process.env.NODE_ENV === 'production' && dev) {
      return true;
    }
  })
  .keys()
  .value();

export function getLobbyNsp(game) {
  return `/game/${game}/lobby`;
}

export function getRoomNsp(game, roomId) {
  return `/game/${game}/room/${roomId}`;
}
