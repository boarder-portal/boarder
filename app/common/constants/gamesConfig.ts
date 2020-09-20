import { EGame } from 'common/types';
import { EPexesoSet } from 'common/types/pexeso';

export const GAMES_CONFIG = {
  games: {
    [EGame.PEXESO]: {
      name: EGame.PEXESO,
      minPlayersCount: 2,
      maxPlayersCount: 4,
      sets: {
        [EPexesoSet.COMMON]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.FRIENDS]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.GAME_OF_THRONES]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.HARRY_POTTER]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.LOST]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.PHILADELPHIA]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.PIRATES]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.POKER]: {
          width: 10,
          height: 6,
        },
        [EPexesoSet.STAR_WARS]: {
          width: 10,
          height: 6,
        },
      },
      defaultGameOptions: {
        set: EPexesoSet.COMMON,
        playersCount: 2,
      },
    },
  },
};
