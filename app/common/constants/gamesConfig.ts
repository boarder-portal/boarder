import CARCASSONNE_CARDS from 'common/constants/carcassonne/cards';
import SEVEN_WONDERS_CARDS from 'common/constants/sevenWonders/cards';
import SEVEN_WONDERS_LEADERS from 'common/constants/sevenWonders/leaders';
import SEVEN_WONDERS_CITIES from 'common/constants/sevenWonders/cities';

import { EPexesoFieldLayout, EPexesoSet } from 'common/types/pexeso';
import { EOnitamaCardType } from 'common/types/onitama';
import { EGame } from 'common/types/game';

const CARCASSONNE_ALL_SIDE_PARTS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const GAMES_CONFIG = {
  games: {
    [EGame.PEXESO]: {
      name: 'Pexeso',
      minPlayersCount: 2,
      maxPlayersCount: 4,
      sets: {
        [EPexesoSet.COMMON]: {
          imagesCount: 30,
          imageVariantsCount: 4,
        },
        [EPexesoSet.FRIENDS]: {
          imagesCount: 30,
          imageVariantsCount: 2,
        },
        [EPexesoSet.GAME_OF_THRONES]: {
          imagesCount: 84,
          imageVariantsCount: 1,
        },
        [EPexesoSet.HARRY_POTTER]: {
          imagesCount: 30,
          imageVariantsCount: 1,
        },
        [EPexesoSet.LOST]: {
          imagesCount: 40,
          imageVariantsCount: 2,
        },
        [EPexesoSet.PHILADELPHIA]: {
          imagesCount: 30,
          imageVariantsCount: 1,
        },
        [EPexesoSet.PIRATES]: {
          imagesCount: 30,
          imageVariantsCount: 1,
        },
        [EPexesoSet.POKER]: {
          imagesCount: 30,
          imageVariantsCount: 1,
        },
        [EPexesoSet.STAR_WARS]: {
          imagesCount: 40,
          imageVariantsCount: 1,
        },
        [EPexesoSet.DST]: {
          imagesCount: 40,
          imageVariantsCount: 1,
        },
        [EPexesoSet.BUILDINGS]: {
          imagesCount: 30,
          imageVariantsCount: 1,
        },
        [EPexesoSet.BREAKING_BAD]: {
          imagesCount: 20,
          imageVariantsCount: 1,
        },
      },
      matchingCardsCounts: [2, 3, 4, 5, 6],
      differentCardsCounts: [4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 40, 48, 54, 60, 72, 84],
      shuffleAfterMovesCounts: [1, 2, 3, 4, 5, 6],
      shuffleCardsCounts: [2, 3, 4, 5, 6],
      fieldOptions: {
        [EPexesoFieldLayout.RECT]: {
          8: { width: 4, height: 2 },
          12: { width: 4, height: 3 },
          16: { width: 4, height: 4 },
          18: { width: 6, height: 3 },
          20: { width: 5, height: 4 },
          24: { width: 6, height: 4 },
          30: { width: 6, height: 5 },
          32: { width: 8, height: 4 },
          36: { width: 6, height: 6 },
          40: { width: 8, height: 5 },
          48: { width: 8, height: 6 },
          50: { width: 10, height: 5 },
          60: { width: 10, height: 6 },
          64: { width: 8, height: 8 },
          72: { width: 9, height: 8 },
          80: { width: 10, height: 8 },
          90: { width: 10, height: 9 },
          96: { width: 12, height: 8 },
          100: { width: 10, height: 10 },
          108: { width: 12, height: 9 },
          120: { width: 12, height: 10 },
          150: { width: 15, height: 10 },
          144: { width: 16, height: 9 },
          160: { width: 16, height: 10 },
          162: { width: 18, height: 9 },
          168: { width: 14, height: 12 },
          180: { width: 18, height: 10 },
          192: { width: 16, height: 12 },
          200: { width: 20, height: 10 },
          216: { width: 18, height: 12 },
          240: { width: 20, height: 12 },
          252: { width: 21, height: 12 },
          270: { width: 18, height: 15 },
          288: { width: 18, height: 16 },
          300: { width: 20, height: 15 },
          324: { width: 18, height: 18 },
          336: { width: 24, height: 14 },
          360: { width: 24, height: 15 },
          420: { width: 28, height: 15 },
          // 432: { width: 24, height: 18 },
          432: { width: 27, height: 16 },
          504: { width: 28, height: 18 },
        } as Record<number, { width: number; height: number }>,

        [EPexesoFieldLayout.HEX]: {
          16: { start: 5, middle: 6 },
          24: { start: 4, middle: 6 },
          72: { start: 9, middle: 12 },
          168: { start: 13, middle: 18 },
          192: { start: 12, middle: 18 },
          336: { start: 16, middle: 24 },
        } as Record<number, { start: number; middle: number }>,
      },
      layoutNames: {
        [EPexesoFieldLayout.RECT]: 'Прямоугольник',
        [EPexesoFieldLayout.HEX]: 'Шестиугольник',
        [EPexesoFieldLayout.SPIRAL]: 'Спираль',
        [EPexesoFieldLayout.SPIRAL_ROTATE]: 'Спираль (поворот)',
      },
      defaultGameOptions: {
        set: EPexesoSet.COMMON,
        playersCount: 2,
        matchingCardsCount: 2,
        differentCardsCount: 30,
        layout: EPexesoFieldLayout.RECT,
        pickRandomImages: false,
        useImageVariants: false,
        shuffleOptions: null,
      },
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
