import { ECarcassonneCardObject, ICarcassonneCard } from 'common/types/carcassonne';

// TODO: fix count for id > 2
const CARCASSONNE_CARDS: ICarcassonneCard[] = [{
  // base cards

  id: 0,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 11], cities: [0] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6, 7, 8, 9] },
  ],
}, {
  id: 1,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0] },
  ],
}, {
  id: 2,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0] },
  ],
}, {
  id: 3,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.CITY, sideParts: [9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8], cities: [0, 1] },
  ],
}, {
  id: 4,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 5,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 6,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shields: 1 },
  ],
}, {
  id: 7,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8], cities: [0] },
  ],
}, {
  id: 8,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8], cities: [0] },
  ],
}, {
  id: 9,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
  ],
}, {
  id: 10,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2, 9, 10, 11] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
  ],
}, {
  id: 11,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 12,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 13,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.CITY, sideParts: [6, 7, 8] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 9, 10, 11], cities: [0, 1] },
  ],
}, {
  id: 14,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 8, 9, 10, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
  ],
}, {
  id: 15,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9] },
  ],
}, {
  id: 16,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  ],
}, {
  id: 17,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11] },
  ],
}, {
  id: 18,
  count: 5,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 7, 8, 9, 10, 11], cities: [0] },
  ],
}, {
  id: 19,
  count: 8,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [4, 10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6, 7, 8, 9] },
  ],
}, {
  id: 20,
  count: 9,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [7, 10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 4, 5, 6, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9] },
  ],
}, {
  id: 21,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sideParts: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7, 10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [3, 4, 5, 6, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9] },
  ],
}, {
  id: 22,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [4] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 1, 2, 3, 11] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9] },
  ],
}, {
  id: 23,
  count: 1,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sideParts: [1] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [4] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [7] },
    { type: ECarcassonneCardObject.ROAD, sideParts: [10] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [2, 3] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [8, 9] },
    { type: ECarcassonneCardObject.FIELD, sideParts: [0, 10] },
  ],
}];

export default CARCASSONNE_CARDS;
