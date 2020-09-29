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
          imagesCount: 33,
        },
        [EPexesoSet.FRIENDS]: {
          width: 10,
          height: 6,
          imagesCount: 30,
        },
        [EPexesoSet.GAME_OF_THRONES]: {
          width: 10,
          height: 6,
          imagesCount: 84,
        },
        [EPexesoSet.HARRY_POTTER]: {
          width: 10,
          height: 6,
          imagesCount: 30,
        },
        [EPexesoSet.LOST]: {
          width: 10,
          height: 6,
          imagesCount: 40,
        },
        [EPexesoSet.PHILADELPHIA]: {
          width: 10,
          height: 6,
          imagesCount: 30,
        },
        [EPexesoSet.PIRATES]: {
          width: 10,
          height: 6,
          imagesCount: 30,
        },
        [EPexesoSet.POKER]: {
          width: 10,
          height: 6,
          imagesCount: 30,
        },
        [EPexesoSet.STAR_WARS]: {
          width: 10,
          height: 6,
          imagesCount: 40,
        },
        [EPexesoSet.DST]: {
          width: 10,
          height: 6,
          imagesCount: 40,
        },
      },
      defaultGameOptions: {
        set: EPexesoSet.COMMON,
        playersCount: 2,
        sameCardsCount: 2,
        pickRandomImages: false,
      },
    },
    [EGame.SURVIVAL_ONLINE]: {
      name: EGame.SURVIVAL_ONLINE,
      minPlayersCount: 1,
      maxPlayersCount: 4,
      cellSize: 100,
      viewSize: {
        width: 21,
        height: 13,
      },
      fieldHeight: 12,
      defaultGameOptions: {
        playersCount: 2,
      },
    },
  },
};
