import { ECarcassonneCardObject, ICarcassonneCard } from 'common/types/carcassonne';

const CARCASSONNE_CARDS: ICarcassonneCard[] = [{
  // base cards

  id: 0,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.56, y: 0.13 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 11], cities: [0], meepleCoords: { x: 0.14, y: 0.31 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 10], meepleCoords: { x: 0.46, y: 0.51 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.52, y: 0.79 } },
  ],
}, {
  id: 1,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.38, y: 0.1 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.71, y: 0.72 } },
  ],
}, {
  id: 2,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.15, y: 0.16 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0], meepleCoords: { x: 0.73, y: 0.74 } },
  ],
}, {
  id: 3,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.49, y: 0.11 } },
    { type: ECarcassonneCardObject.CITY, sideParts: [9, 10, 11], meepleCoords: { x: 0.05, y: 0.52 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0, 1], meepleCoords: { x: 0.59, y: 0.66 } },
  ],
}, {
  id: 4,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.55, y: 0.39 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.56, y: 0.88 } },
  ],
}, {
  id: 5,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.57, y: 0.43 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.55, y: 0.87 } },
  ],
}, {
  id: 6,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shields: 1, meepleCoords: { x: 0.51, y: 0.51 } },
  ],
}, {
  id: 7,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.54, y: 0.4 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.51, y: 0.87 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.69, y: 0.9 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.32, y: 0.92 } },
  ],
}, {
  id: 8,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.57, y: 0.38 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.51, y: 0.86 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6], cities: [0], meepleCoords: { x: 0.7, y: 0.89 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8], cities: [0], meepleCoords: { x: 0.34, y: 0.92 } },
  ],
}, {
  id: 9,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1, meepleCoords: { x: 0.36, y: 0.11 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.73, y: 0.73 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8], cities: [0], meepleCoords: { x: 0.59, y: 0.55 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.85, y: 0.89 } },
  ],
}, {
  id: 10,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], meepleCoords: { x: 0.16, y: 0.18 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.73, y: 0.71 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8], cities: [0], meepleCoords: { x: 0.58, y: 0.55 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.86, y: 0.87 } },
  ],
}, {
  id: 11,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [3, 4, 5, 9, 10, 11], shields: 1, meepleCoords: { x: 0.52, y: 0.48 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.55, y: 0.08 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.51, y: 0.91 } },
  ],
}, {
  id: 12,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [3, 4, 5, 9, 10, 11], meepleCoords: { x: 0.55, y: 0.42 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2], cities: [0], meepleCoords: { x: 0.59, y: 0.07 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0], meepleCoords: { x: 0.52, y: 0.9 } },
  ],
}, {
  id: 13,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.53, y: 0.12 } },
    { type: ECarcassonneCardObject.CITY, sideParts: [6, 7, 8], meepleCoords: { x: 0.5, y: 0.9 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 9, 10, 11], cities: [0, 1], meepleCoords: { x: 0.54, y: 0.51 } },
  ],
}, {
  id: 14,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.5, y: 0.12 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7], meepleCoords: { x: 0.62, y: 0.66 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.27, y: 0.57 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.79, y: 0.8 } },
  ],
}, {
  id: 15,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.55, y: 0.12 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4], meepleCoords: { x: 0.82, y: 0.61 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.88 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10], meepleCoords: { x: 0.23, y: 0.54 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 11], cities: [0], meepleCoords: { x: 0.66, y: 0.46 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.8, y: 0.83 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.81 } },
  ],
}, {
  id: 16,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY, meepleCoords: { x: 0.52, y: 0.52 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], meepleCoords: { x: 0.79, y: 0.83 } },
  ],
}, {
  id: 17,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY, meepleCoords: { x: 0.52, y: 0.48 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.47, y: 0.86 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11], meepleCoords: { x: 0.82, y: 0.26 } },
  ],
}, {
  id: 18,
  count: 5,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.51, y: 0.13 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8, 9, 10, 11], cities: [0], meepleCoords: { x: 0.54, y: 0.67 } },
  ],
}, {
  id: 19,
  count: 8,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 10], meepleCoords: { x: 0.57, y: 0.47 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.48, y: 0.22 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6, 7, 8, 9], meepleCoords: { x: 0.56, y: 0.8 } },
  ],
}, {
  id: 20,
  count: 9,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [7, 10], meepleCoords: { x: 0.44, y: 0.53 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 11], meepleCoords: { x: 0.62, y: 0.27 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.77 } },
  ],
}, {
  id: 21,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2], meepleCoords: { x: 0.42, y: 0.1 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7, 10], meepleCoords: { x: 0.4, y: 0.65 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 11], cities: [0], meepleCoords: { x: 0.69, y: 0.53 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.19, y: 0.82 } },
  ],
}, {
  id: 22,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [4], meepleCoords: { x: 0.88, y: 0.48 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.49, y: 0.84 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10], meepleCoords: { x: 0.2, y: 0.49 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 11], meepleCoords: { x: 0.49, y: 0.19 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.8, y: 0.82 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.23, y: 0.78 } },
  ],
}, {
  id: 23,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [1], meepleCoords: { x: 0.6, y: 0.19 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4], meepleCoords: { x: 0.82, y: 0.58 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7], meepleCoords: { x: 0.5, y: 0.84 } },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10], meepleCoords: { x: 0.19, y: 0.5 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [2, 3], meepleCoords: { x: 0.83, y: 0.29 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6], meepleCoords: { x: 0.78, y: 0.83 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9], meepleCoords: { x: 0.21, y: 0.81 } },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 10], meepleCoords: { x: 0.26, y: 0.22 } },
  ],
}];

export default CARCASSONNE_CARDS;
