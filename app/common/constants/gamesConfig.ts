import SEVEN_WONDERS_CARDS from 'common/constants/sevenWonders/cards';
import SEVEN_WONDERS_LEADERS from 'common/constants/sevenWonders/leaders';
import SEVEN_WONDERS_CITIES from 'common/constants/sevenWonders/cities';

import { EGame } from 'common/types/game';

export const GAMES_CONFIG = {
  games: {
    [EGame.SEVEN_WONDERS]: {
      defaultGameOptions: {
        playersCount: 3,
      },
      cardsByAge: SEVEN_WONDERS_CARDS,
      allLeaders: SEVEN_WONDERS_LEADERS,
      allCities: SEVEN_WONDERS_CITIES,
    },
  },
};
