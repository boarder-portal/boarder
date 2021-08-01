import { ECarcassonneCardObject, ICarcassonneCard } from 'common/types/carcassonne';

// TODO: fix count for id > 2
const CARCASSONNE_CARDS: ICarcassonneCard[] = [{
  // base cards

  id: 0,
  count: 4,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 11], cities: [0] },
    { type: ECarcassonneCardObject.ROAD, sides: [4, 10] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6, 7, 8, 9] },
  ],
}, {
  id: 1,
  count: 2,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 6, 7, 8], cities: [0] },
  ],
}, {
  id: 2,
  count: 3,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 6, 7, 8], cities: [0] },
  ],
}, {
  id: 3,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.CITY, sides: [9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 6, 7, 8], cities: [0, 1] },
  ],
}, {
  id: 4,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sides: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 5,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 6,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shields: 1 },
  ],
}, {
  id: 7,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.FIELD, sides: [6], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [8], cities: [0] },
  ],
}, {
  id: 8,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.FIELD, sides: [6], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [8], cities: [0] },
  ],
}, {
  id: 9,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.ROAD, sides: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 8], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
  ],
}, {
  id: 10,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2, 9, 10, 11] },
    { type: ECarcassonneCardObject.ROAD, sides: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 8], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
  ],
}, {
  id: 11,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [3, 4, 5, 9, 10, 11], shields: 1 },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 12,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [3, 4, 5, 9, 10, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [6, 7, 8], cities: [0] },
  ],
}, {
  id: 13,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.CITY, sides: [6, 7, 8] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 9, 10, 11], cities: [0, 1] },
  ],
}, {
  id: 14,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sides: [4, 7] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 8, 9, 10, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
  ],
}, {
  id: 15,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sides: [4] },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.ROAD, sides: [10] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sides: [8, 9] },
  ],
}, {
  id: 16,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  ],
}, {
  id: 17,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.MONASTERY },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11] },
  ],
}, {
  id: 18,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 6, 7, 8, 9, 10, 11], cities: [0] },
  ],
}, {
  id: 19,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sides: [4, 10] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2, 3, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6, 7, 8, 9] },
  ],
}, {
  id: 20,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sides: [7, 10] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2, 3, 4, 5, 6, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [8, 9] },
  ],
}, {
  id: 21,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.CITY, sides: [0, 1, 2] },
    { type: ECarcassonneCardObject.ROAD, sides: [7, 10] },
    { type: ECarcassonneCardObject.FIELD, sides: [3, 4, 5, 6, 11], cities: [0] },
    { type: ECarcassonneCardObject.FIELD, sides: [8, 9] },
  ],
}, {
  id: 22,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sides: [4] },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.ROAD, sides: [10] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 1, 2, 3, 11] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sides: [8, 9] },
  ],
}, {
  id: 23,
  count: 0,
  objects: [
    { type: ECarcassonneCardObject.ROAD, sides: [1] },
    { type: ECarcassonneCardObject.ROAD, sides: [4] },
    { type: ECarcassonneCardObject.ROAD, sides: [7] },
    { type: ECarcassonneCardObject.ROAD, sides: [10] },
    { type: ECarcassonneCardObject.FIELD, sides: [2, 3] },
    { type: ECarcassonneCardObject.FIELD, sides: [5, 6] },
    { type: ECarcassonneCardObject.FIELD, sides: [8, 9] },
    { type: ECarcassonneCardObject.FIELD, sides: [0, 10] },
  ],
}];

export default CARCASSONNE_CARDS;
