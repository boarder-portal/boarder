import { Card, CardObjectType, CityGoodsType } from 'common/types/games/carcassonne';

const ALL_CARDS: Card[] = [
  // base cards
  {
    id: 0,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.56, y: 0.13 } },
      { type: CardObjectType.FIELD, sideParts: [3, 11], cities: [0], meepleCoords: { x: 0.14, y: 0.31 } },
      { type: CardObjectType.ROAD, sideParts: [4, 10], meepleCoords: { x: 0.46, y: 0.51 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.52, y: 0.79 } },
    ],
  },
  {
    id: 1,
    count: 2,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.38, y: 0.1 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.71, y: 0.72 } },
    ],
  },
  {
    id: 2,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.15, y: 0.16 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.73, y: 0.74 } },
    ],
  },
  {
    id: 3,
    count: 2,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.49, y: 0.11 } },
      { type: CardObjectType.CITY, sideParts: [9, 10, 11], meepleCoords: { x: 0.05, y: 0.52 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0, 1], meepleCoords: { x: 0.59, y: 0.66 } },
    ],
  },
  {
    id: 4,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11],
        shields: 1,
        meepleCoords: { x: 0.55, y: 0.39 },
      },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.56, y: 0.88 } },
    ],
  },
  {
    id: 5,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.57, y: 0.43 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.55, y: 0.87 } },
    ],
  },
  {
    id: 6,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        shields: 1,
        meepleCoords: { x: 0.51, y: 0.51 },
      },
    ],
  },
  {
    id: 7,
    count: 2,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11],
        shields: 1,
        meepleCoords: { x: 0.54, y: 0.4 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.51, y: 0.87 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.69, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.32, y: 0.92 } },
    ],
  },
  {
    id: 8,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.57, y: 0.38 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.51, y: 0.86 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.7, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.34, y: 0.92 } },
    ],
  },
  {
    id: 9,
    count: 2,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.36, y: 0.11 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.73, y: 0.73 } },
      { type: CardObjectType.FIELD, sideParts: [3, 8], cities: [0], meepleCoords: { x: 0.59, y: 0.55 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.85, y: 0.89 } },
    ],
  },
  {
    id: 10,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.16, y: 0.18 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.73, y: 0.71 } },
      { type: CardObjectType.FIELD, sideParts: [3, 8], cities: [0], meepleCoords: { x: 0.58, y: 0.55 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.86, y: 0.87 } },
    ],
  },
  {
    id: 11,
    count: 2,
    objects: [
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.52, y: 0.48 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.55, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.51, y: 0.91 } },
    ],
  },
  {
    id: 12,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.55, y: 0.42 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.59, y: 0.07 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.52, y: 0.9 } },
    ],
  },
  {
    id: 13,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.53, y: 0.12 } },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.5, y: 0.9 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [3, 4, 5, 9, 10, 11],
        cities: [0, 1],
        meepleCoords: { x: 0.54, y: 0.51 },
      },
    ],
  },
  {
    id: 14,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.5, y: 0.12 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.63, y: 0.63 } },
      { type: CardObjectType.FIELD, sideParts: [3, 8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.27, y: 0.57 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.79, y: 0.8 } },
    ],
  },
  {
    id: 15,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.55, y: 0.12 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.82, y: 0.61 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.88 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.23, y: 0.54 } },
      { type: CardObjectType.FIELD, sideParts: [3, 11], cities: [0], meepleCoords: { x: 0.66, y: 0.46 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.8, y: 0.83 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.81 } },
    ],
  },
  {
    id: 16,
    count: 4,
    objects: [
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.52, y: 0.52 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        meepleCoords: { x: 0.79, y: 0.83 },
      },
    ],
  },
  {
    id: 17,
    count: 2,
    objects: [
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.52, y: 0.48 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.47, y: 0.86 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11],
        meepleCoords: { x: 0.82, y: 0.26 },
      },
    ],
  },
  {
    id: 18,
    count: 5,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.51, y: 0.13 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        cities: [0],
        meepleCoords: { x: 0.54, y: 0.67 },
      },
    ],
  },
  {
    id: 19,
    count: 8,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [4, 10], meepleCoords: { x: 0.57, y: 0.47 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.48, y: 0.22 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.56, y: 0.8 } },
    ],
  },
  {
    id: 20,
    count: 9,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [7, 10], meepleCoords: { x: 0.44, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 11], meepleCoords: { x: 0.62, y: 0.27 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.77 } },
    ],
  },
  {
    id: 21,
    count: 3,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.42, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [7, 10], meepleCoords: { x: 0.4, y: 0.65 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 11], cities: [0], meepleCoords: { x: 0.69, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.19, y: 0.82 } },
    ],
  },
  {
    id: 22,
    count: 4,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.88, y: 0.48 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.84 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.2, y: 0.49 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.49, y: 0.19 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.8, y: 0.82 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.78 } },
    ],
  },
  {
    id: 23,
    count: 1,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [1], meepleCoords: { x: 0.6, y: 0.19 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.82, y: 0.58 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.84 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.19, y: 0.5 } },
      { type: CardObjectType.FIELD, sideParts: [2, 3], meepleCoords: { x: 0.83, y: 0.29 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.78, y: 0.83 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.21, y: 0.81 } },
      { type: CardObjectType.FIELD, sideParts: [0, 11], meepleCoords: { x: 0.26, y: 0.22 } },
    ],
  },

  // inns & cathedrals
  {
    id: 24,
    count: 1,
    objects: [
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 11], meepleCoords: { x: 0.78, y: 0.79 } },
      { type: CardObjectType.ROAD, sideParts: [7, 10], inn: true, meepleCoords: { x: 0.44, y: 0.5 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.21, y: 0.79 } },
    ],
  },
  {
    id: 25,
    count: 1,
    objects: [
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.83, y: 0.16 } },
      { type: CardObjectType.ROAD, sideParts: [4, 10], inn: true, meepleCoords: { x: 0.42, y: 0.57 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.49, y: 0.82 } },
    ],
  },
  {
    id: 26,
    count: 1,
    objects: [
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.24, y: 0.25 } },
      { type: CardObjectType.ROAD, sideParts: [4], inn: true, meepleCoords: { x: 0.81, y: 0.61 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.8, y: 0.86 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.88 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.17, y: 0.82 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.19, y: 0.52 } },
    ],
  },
  {
    id: 27,
    count: 1,
    objects: [
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.75, y: 0.2 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.87, y: 0.47 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.48, y: 0.88 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.12, y: 0.55 } },
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.48, y: 0.53 } },
    ],
  },
  {
    id: 28,
    count: 1,
    objects: [
      { type: CardObjectType.FIELD, sideParts: [0, 11], meepleCoords: { x: 0.22, y: 0.26 } },
      { type: CardObjectType.ROAD, sideParts: [1, 10], meepleCoords: { x: 0.35, y: 0.41 } },
      { type: CardObjectType.FIELD, sideParts: [2, 3, 8, 9], meepleCoords: { x: 0.5, y: 0.6 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.69, y: 0.76 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.83, y: 0.9 } },
    ],
  },
  {
    id: 29,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.18, y: 0.25 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.8, y: 0.34 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.67, y: 0.54 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.61, y: 0.86 } },
    ],
  },
  {
    id: 30,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.58, y: 0.43 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5], cities: [0], meepleCoords: { x: 0.92, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.2, y: 0.76 } },
    ],
  },
  {
    id: 31,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.46, y: 0.07 } },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5], meepleCoords: { x: 0.91, y: 0.52 } },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.52, y: 0.94 } },
      { type: CardObjectType.CITY, sideParts: [9, 10, 11], meepleCoords: { x: 0.13, y: 0.52 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1, 2, 3], meepleCoords: { x: 0.48, y: 0.53 } },
    ],
  },
  {
    id: 32,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.51, y: 0.14 } },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.53, y: 0.91 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.86, y: 0.33 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.77, y: 0.47 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [1], meepleCoords: { x: 0.88, y: 0.7 } },
      { type: CardObjectType.FIELD, sideParts: [9], cities: [1], meepleCoords: { x: 0.14, y: 0.71 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.16, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.14, y: 0.34 } },
    ],
  },
  {
    id: 33,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.53, y: 0.14 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6], cities: [0], meepleCoords: { x: 0.76, y: 0.66 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.52, y: 0.68 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.21, y: 0.67 } },
    ],
  },
  {
    id: 34,
    count: 2,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        cathedral: true,
        meepleCoords: { x: 0.46, y: 0.5 },
      },
    ],
  },
  {
    id: 35,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.13, y: 0.41 } },
      { type: CardObjectType.FIELD, sideParts: [3, 8], cities: [0], meepleCoords: { x: 0.44, y: 0.69 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], inn: true, meepleCoords: { x: 0.67, y: 0.76 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.84, y: 0.88 } },
    ],
  },
  {
    id: 36,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.51, y: 0.13 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 11], cities: [0], meepleCoords: { x: 0.12, y: 0.34 } },
      { type: CardObjectType.ROAD, sideParts: [7, 10], inn: true, meepleCoords: { x: 0.36, y: 0.62 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.15, y: 0.8 } },
    ],
  },
  {
    id: 37,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.17, y: 0.29 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6], cities: [0], meepleCoords: { x: 0.66, y: 0.87 } },
      { type: CardObjectType.ROAD, sideParts: [7], inn: true, meepleCoords: { x: 0.5, y: 0.76 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.28, y: 0.87 } },
    ],
  },
  {
    id: 38,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.48, y: 0.09 } },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5], meepleCoords: { x: 0.9, y: 0.51 } },
      { type: CardObjectType.CITY, sideParts: [9, 10, 11], meepleCoords: { x: 0.11, y: 0.55 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0, 1, 2], meepleCoords: { x: 0.48, y: 0.66 } },
    ],
  },
  {
    id: 39,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.33, y: 0.16 } },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.52, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5], cities: [0, 1], meepleCoords: { x: 0.65, y: 0.57 } },
    ],
  },
  {
    id: 40,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.32, y: 0.45 } },
      { type: CardObjectType.ROAD, sideParts: [1], meepleCoords: { x: 0.55, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.91 } },
      { type: CardObjectType.FIELD, sideParts: [0], cities: [0], meepleCoords: { x: 0.34, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [2], cities: [0], meepleCoords: { x: 0.71, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.72, y: 0.92 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.25, y: 0.93 } },
    ],
  },

  // traders & builders
  {
    id: 41,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.48, y: 0.13 },
      },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.7, y: 0.69 } },
    ],
  },
  {
    id: 42,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.45, y: 0.13 },
      },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.7, y: 0.69 } },
    ],
  },
  {
    id: 43,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.FABRIC,
        meepleCoords: { x: 0.65, y: 0.41 },
      },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.42, y: 0.95 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.49, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.7, y: 0.76 } },
    ],
  },
  {
    id: 44,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.64, y: 0.34 },
      },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.58, y: 0.85 } },
    ],
  },
  {
    id: 45,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.63, y: 0.37 },
      },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.45, y: 0.95 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.47, y: 0.07 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.71, y: 0.77 } },
    ],
  },
  {
    id: 46,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.FABRIC,
        meepleCoords: { x: 0.46, y: 0.14 },
      },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5], meepleCoords: { x: 0.92, y: 0.45 } },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.51, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1, 2], meepleCoords: { x: 0.6, y: 0.53 } },
    ],
  },
  {
    id: 47,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.11, y: 0.47 },
      },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 6, 7, 8], meepleCoords: { x: 0.85, y: 0.86 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.56, y: 0.5 } },
    ],
  },
  {
    id: 48,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.58, y: 0.38 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.42, y: 0.88 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.7, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.25, y: 0.92 } },
    ],
  },
  {
    id: 49,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.54, y: 0.39 },
      },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.92, y: 0.41 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.92, y: 0.25 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [0], meepleCoords: { x: 0.92, y: 0.62 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.44, y: 0.9 } },
    ],
  },
  {
    id: 50,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.FABRIC,
        meepleCoords: { x: 0.44, y: 0.14 },
      },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.68, y: 0.55 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.8, y: 0.35 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.56, y: 0.82 } },
    ],
  },
  {
    id: 51,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.FABRIC,
        meepleCoords: { x: 0.5, y: 0.16 },
      },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.52, y: 0.92 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.69, y: 0.55 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.81, y: 0.36 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [0, 1], meepleCoords: { x: 0.85, y: 0.71 } },
    ],
  },
  {
    id: 52,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.5, y: 0.15 },
      },
      { type: CardObjectType.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.52, y: 0.91 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.67, y: 0.58 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.79, y: 0.38 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [0, 1], meepleCoords: { x: 0.86, y: 0.71 } },
    ],
  },
  {
    id: 53,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.FABRIC,
        meepleCoords: { x: 0.5, y: 0.45 },
      },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.91, y: 0.44 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.45, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.91, y: 0.26 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [0], meepleCoords: { x: 0.91, y: 0.65 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.61, y: 0.92 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.26, y: 0.91 } },
    ],
  },
  {
    id: 54,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.46, y: 0.16 },
      },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.82, y: 0.44 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.51, y: 0.74 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.91, y: 0.32 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], cities: [0], meepleCoords: { x: 0.75, y: 0.73 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.3, y: 0.86 } },
    ],
  },
  {
    id: 55,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.63, y: 0.46 },
      },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.54, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.51, y: 0.9 } },
    ],
  },
  {
    id: 56,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.5, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.64, y: 0.52 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.81, y: 0.33 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [5, 6, 7, 8, 9, 10, 11],
        cities: [0],
        meepleCoords: { x: 0.57, y: 0.77 },
      },
    ],
  },
  {
    id: 57,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.59, y: 0.45 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.55, y: 0.08 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.7, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.27, y: 0.91 } },
    ],
  },
  {
    id: 58,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.6, y: 0.48 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.9 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.55, y: 0.06 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.73, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.29, y: 0.91 } },
    ],
  },
  {
    id: 59,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [3, 4, 5, 9, 10, 11],
        goods: CityGoodsType.WINE,
        meepleCoords: { x: 0.62, y: 0.5 },
      },
      { type: CardObjectType.ROAD, sideParts: [1], meepleCoords: { x: 0.48, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [0], cities: [0], meepleCoords: { x: 0.3, y: 0.1 } },
      { type: CardObjectType.FIELD, sideParts: [2], cities: [0], meepleCoords: { x: 0.7, y: 0.12 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.71, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.29, y: 0.9 } },
    ],
  },
  {
    id: 60,
    count: 1,
    objects: [
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.42, y: 0.51 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.87, y: 0.48 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.55, y: 0.86 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.12, y: 0.57 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.63, y: 0.22 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.81, y: 0.82 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.21, y: 0.85 } },
    ],
  },
  {
    id: 61,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.48, y: 0.4 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.45, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5], cities: [0], meepleCoords: { x: 0.92, y: 0.49 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.64, y: 0.93 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.28, y: 0.92 } },
    ],
  },
  {
    id: 62,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 9, 10, 11],
        goods: CityGoodsType.WHEAT,
        meepleCoords: { x: 0.5, y: 0.13 },
      },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.71 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6], cities: [0], meepleCoords: { x: 0.75, y: 0.62 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.32, y: 0.84 } },
    ],
  },
  {
    id: 63,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.41, y: 0.11 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.53, y: 0.79 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.15, y: 0.54 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6], cities: [0], meepleCoords: { x: 0.79, y: 0.75 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.26, y: 0.79 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.13, y: 0.32 } },
    ],
  },
  {
    id: 64,
    count: 1,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [1, 7], meepleCoords: { x: 0.47, y: 0.23 } },
      { type: CardObjectType.ROAD, sideParts: [4, 10], meepleCoords: { x: 0.82, y: 0.5 } },
      { type: CardObjectType.FIELD, sideParts: [0, 11], meepleCoords: { x: 0.21, y: 0.22 } },
      { type: CardObjectType.FIELD, sideParts: [2, 3], meepleCoords: { x: 0.78, y: 0.27 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.77, y: 0.8 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.26, y: 0.75 } },
    ],
  },

  // king & robber
  {
    id: 65,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 6, 7, 8], meepleCoords: { x: 0.46, y: 0.9 } },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.15, y: 0.44 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.75, y: 0.19 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.73, y: 0.76 } },
    ],
  },
  {
    id: 66,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.41, y: 0.39 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.91, y: 0.44 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.43, y: 0.89 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.92, y: 0.25 } },
      { type: CardObjectType.FIELD, sideParts: [5], cities: [0], meepleCoords: { x: 0.92, y: 0.66 } },
      { type: CardObjectType.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.62, y: 0.92 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.24, y: 0.92 } },
    ],
  },
  {
    id: 67,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.41, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.73, y: 0.67 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.28, y: 0.51 } },
      { type: CardObjectType.FIELD, sideParts: [3, 8, 9], cities: [0], meepleCoords: { x: 0.67, y: 0.44 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.83, y: 0.86 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.16, y: 0.37 } },
    ],
  },
  {
    id: 68,
    count: 1,
    objects: [
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.51, y: 0.65 } },
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.39, y: 0.12 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [3, 4, 5, 6, 7, 8, 9, 10, 11],
        cities: [1],
        meepleCoords: { x: 0.82, y: 0.81 },
      },
    ],
  },
  {
    id: 69,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.46, y: 0.1 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.33, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8, 9], cities: [0], meepleCoords: { x: 0.69, y: 0.74 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.21, y: 0.35 } },
    ],
  },

  // abbot & mayor
  {
    id: 70,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [9, 10, 11], shields: 1, meepleCoords: { x: 0.29, y: 0.48 } },
      { type: CardObjectType.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.44, y: 0.09 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5], cities: [0], meepleCoords: { x: 0.91, y: 0.49 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.41, y: 0.89 } },
    ],
  },
  {
    id: 71,
    count: 1,
    objects: [
      {
        type: CardObjectType.CITY,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        shields: 2,
        meepleCoords: { x: 0.54, y: 0.57 },
      },
    ],
  },
  {
    id: 72,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], shields: 1, meepleCoords: { x: 0.4, y: 0.42 } },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.72, y: 0.46 } },
      { type: CardObjectType.FIELD, sideParts: [6, 7, 8], cities: [0, 1], meepleCoords: { x: 0.7, y: 0.84 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.73, y: 0.21 } },
    ],
  },
  {
    id: 73,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2, 6, 7, 8], shields: 1, meepleCoords: { x: 0.4, y: 0.42 } },
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.72, y: 0.46 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.74, y: 0.19 } },
      { type: CardObjectType.FIELD, sideParts: [], cities: [0, 1], meepleCoords: { x: 0.72, y: 0.74 } },
    ],
  },
  {
    id: 74,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.47, y: 0.12 } },
      { type: CardObjectType.CITY, sideParts: [9, 10, 11], meepleCoords: { x: 0.05, y: 0.57 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.74, y: 0.49 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.42, y: 0.76 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.83, y: 0.31 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], cities: [0, 1], meepleCoords: { x: 0.69, y: 0.77 } },
      { type: CardObjectType.FIELD, sideParts: [8], cities: [1], meepleCoords: { x: 0.27, y: 0.89 } },
    ],
  },
  {
    id: 75,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.77, y: 0.46 } },
      { type: CardObjectType.ROAD, sideParts: [1, 7], meepleCoords: { x: 0.53, y: 0.26 } },
      { type: CardObjectType.FIELD, sideParts: [0], cities: [0], meepleCoords: { x: 0.35, y: 0.06 } },
      { type: CardObjectType.FIELD, sideParts: [2], cities: [0], meepleCoords: { x: 0.74, y: 0.07 } },
      { type: CardObjectType.FIELD, sideParts: [6, 8], cities: [0], meepleCoords: { x: 0.72, y: 0.87 } },
    ],
  },
  {
    id: 76,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.49, y: 0.14 } },
      { type: CardObjectType.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.44, y: 0.54 } },
      { type: CardObjectType.FIELD, sideParts: [3], cities: [0], meepleCoords: { x: 0.88, y: 0.28 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.69, y: 0.71 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.18, y: 0.5 } },
    ],
  },
  {
    id: 77,
    count: 1,
    objects: [
      { type: CardObjectType.MONASTERY, meepleCoords: { x: 0.48, y: 0.51 } },
      { type: CardObjectType.ROAD, sideParts: [1], meepleCoords: { x: 0.47, y: 0.15 } },
      { type: CardObjectType.ROAD, sideParts: [4], meepleCoords: { x: 0.89, y: 0.54 } },
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.43, y: 0.84 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.13, y: 0.52 } },
      { type: CardObjectType.FIELD, sideParts: [0, 11], meepleCoords: { x: 0.22, y: 0.25 } },
      { type: CardObjectType.FIELD, sideParts: [2, 3], meepleCoords: { x: 0.76, y: 0.27 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.76, y: 0.82 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.17, y: 0.79 } },
    ],
  },
  {
    id: 78,
    count: 1,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [7], meepleCoords: { x: 0.52, y: 0.75 } },
      {
        type: CardObjectType.FIELD,
        sideParts: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11],
        meepleCoords: { x: 0.75, y: 0.33 },
      },
    ],
  },
  {
    id: 79,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.45, y: 0.11 } },
      { type: CardObjectType.ROAD, sideParts: [10], meepleCoords: { x: 0.29, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6, 7, 8, 9], cities: [0], meepleCoords: { x: 0.7, y: 0.69 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.19, y: 0.36 } },
    ],
  },
  {
    id: 80,
    count: 1,
    objects: [
      { type: CardObjectType.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.45, y: 0.11 } },
      { type: CardObjectType.ROAD, sideParts: [7, 10], meepleCoords: { x: 0.56, y: 0.53 } },
      { type: CardObjectType.FIELD, sideParts: [3, 4, 5, 6], cities: [0], meepleCoords: { x: 0.79, y: 0.57 } },
      { type: CardObjectType.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.28, y: 0.7 } },
      { type: CardObjectType.FIELD, sideParts: [11], cities: [0], meepleCoords: { x: 0.1, y: 0.27 } },
    ],
  },
  {
    id: 81,
    count: 1,
    objects: [
      { type: CardObjectType.ROAD, sideParts: [1, 4, 10], meepleCoords: { x: 0.65, y: 0.51 } },
      { type: CardObjectType.FIELD, sideParts: [0, 11], meepleCoords: { x: 0.21, y: 0.22 } },
      { type: CardObjectType.FIELD, sideParts: [2, 3], meepleCoords: { x: 0.77, y: 0.26 } },
      { type: CardObjectType.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.64, y: 0.84 } },
    ],
  },
];

export default ALL_CARDS;
