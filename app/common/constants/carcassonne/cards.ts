import { ECarcassonneCardObject, ICarcassonneCard } from 'common/types/carcassonne';

// TODO: fix count for id > 2
const CARCASSONNE_CARDS: ICarcassonneCard[] = [{
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
}];

export default CARCASSONNE_CARDS;
