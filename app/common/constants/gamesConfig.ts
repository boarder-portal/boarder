import CARCASSONNE_CARDS from 'common/constants/carcassonne/cards';
import SEVEN_WONDERS_CARDS from 'common/constants/sevenWonders/cards';
import SEVEN_WONDERS_LEADERS from 'common/constants/sevenWonders/leaders';
import SEVEN_WONDERS_CITIES from 'common/constants/sevenWonders/cities';

import { EOnitamaCardType } from 'common/types/onitama';
import { EGame } from 'common/types/game';

const CARCASSONNE_ALL_SIDE_PARTS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const GAMES_CONFIG = {
  games: {
    [EGame.PEXESO]: {
      name: 'Pexeso',
    },
    [EGame.SURVIVAL_ONLINE]: {
      name: 'Выживать онлайн',
      minPlayersCount: 1,
      maxPlayersCount: 4,
      cellSize: 100,
      viewSize: {
        width: 21,
        height: 13,
      },
      inventoryItemsCount: 7,
      defaultGameOptions: {
        playersCount: 2,
      },
      colors: {
        bananaMania: '#F1DCA7',
        pistachio: '#90BE6D',
        budGreen: '#90BE6D',
        laurenGreen: '#A3B18A',
        fernGreen: '#588157',
        hunterGreen: '#3A5A40',
        rawSienna: '#D08C60',
        beaver: '#997B66',
        coffee: '#8A5A44',
      },
    },
    [EGame.MAZE]: {
      name: 'Лабиринт',
      mazeWidth: 30,
      mazeHeight: 16,
      cellSize: 30,
      wallThickness: 2,
      playerSize: 7,
      defaultGameOptions: {
        playersCount: 2,
      },
    },
    [EGame.SET]: {
      name: 'Сет',
      startCardCountToShow: 12,
      cardsCountToAddIfNoSet: 3,
      pointsForSet: 1,
      pointsForWrongSet: -1,
      pointsForUnderstandingThereAreNoSet: 2,
      pointsForWrongUnderstandingThereAreNoSet: -1,
      minPlayersCount: 1,
      maxPlayersCount: 4,
      defaultGameOptions: {
        playersCount: 2,
      },
    },
    [EGame.ONITAMA]: {
      name: 'Онитама',
      defaultGameOptions: {
        playersCount: 2,
      },
      allCards: {
        [EOnitamaCardType.TIGER]: [
          [+2, 0],
          [-1, 0],
        ],
        [EOnitamaCardType.DRAGON]: [
          [+1, -2],
          [+1, +2],
          [-1, -1],
          [-1, +1],
        ],
        [EOnitamaCardType.FROG]: [
          [0, -2],
          [+1, -1],
          [-1, +1],
        ],
        [EOnitamaCardType.RABBIT]: [
          [0, +2],
          [+1, +1],
          [-1, -1],
        ],
        [EOnitamaCardType.CRAB]: [
          [0, -2],
          [+1, 0],
          [0, +2],
        ],
        [EOnitamaCardType.ELEPHANT]: [
          [+1, -1],
          [+1, +1],
          [0, -1],
          [0, +1],
        ],
        [EOnitamaCardType.GOOSE]: [
          [+1, -1],
          [0, -1],
          [0, +1],
          [-1, +1],
        ],
        [EOnitamaCardType.ROOSTER]: [
          [+1, +1],
          [0, +1],
          [0, -1],
          [-1, -1],
        ],
        [EOnitamaCardType.MONKEY]: [
          [+1, -1],
          [+1, +1],
          [-1, +1],
          [-1, -1],
        ],
        [EOnitamaCardType.MANTIS]: [
          [+1, -1],
          [+1, +1],
          [-1, 0],
        ],
        [EOnitamaCardType.HORSE]: [
          [+1, 0],
          [0, -1],
          [-1, 0],
        ],
        [EOnitamaCardType.OX]: [
          [+1, 0],
          [0, +1],
          [-1, 0],
        ],
        [EOnitamaCardType.CRANE]: [
          [-1, -1],
          [-1, +1],
          [+1, 0],
        ],
        [EOnitamaCardType.BOAR]: [
          [+1, 0],
          [0, -1],
          [0, +1],
        ],
        [EOnitamaCardType.EEL]: [
          [+1, -1],
          [0, +1],
          [-1, -1],
        ],
        [EOnitamaCardType.COBRA]: [
          [+1, +1],
          [0, -1],
          [-1, +1],
        ],
      },
    },
    [EGame.CARCASSONNE]: {
      name: 'Каркассон',
      defaultGameOptions: {
        playersCount: 4,
      },
      allCards: CARCASSONNE_CARDS,
      allSideParts: CARCASSONNE_ALL_SIDE_PARTS,
      cardsInHand: 3,
    },
    [EGame.SEVEN_WONDERS]: {
      name: 'Семь чудес',
      defaultGameOptions: {
        playersCount: 3,
      },
      cardsByAge: SEVEN_WONDERS_CARDS,
      allLeaders: SEVEN_WONDERS_LEADERS,
      allCities: SEVEN_WONDERS_CITIES,
    },
  },
};
