import CARCASSONNE_CARDS from 'common/constants/carcassonne/cards';
import SEVEN_WONDERS_CARDS from 'common/constants/sevenWonders/cards';
import SEVEN_WONDERS_LEADERS from 'common/constants/sevenWonders/leaders';
import SEVEN_WONDERS_CITIES from 'common/constants/sevenWonders/cities';

import { EGame } from 'common/types/game';

const CARCASSONNE_ALL_SIDE_PARTS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const GAMES_CONFIG = {
  games: {
    [EGame.CARCASSONNE]: {
      defaultGameOptions: {
        playersCount: 4,
      },
      allCards: CARCASSONNE_CARDS,
      allSideParts: CARCASSONNE_ALL_SIDE_PARTS,
      cardsInHand: 3,
    },
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
