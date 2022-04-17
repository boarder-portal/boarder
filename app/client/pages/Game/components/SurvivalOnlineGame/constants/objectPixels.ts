import { COLORS } from 'common/constants/games/survivalOnline';

const {
  budGreen,
  fernGreen,
  coffee,
} = COLORS;

export const OBJECT_PIXELS = {
  grass: [{ x: 0, y: 0, width: 1, height: 1, color: budGreen }],
  tree: [
    { x: 0, y: 0, width: 1, height: 0.6, color: fernGreen },
    { x: 0.3, y: 0.6, width: 0.4, height: 0.4, color: coffee },
  ],
  base: [
    { x: 0, y: 0, width: 1, height: 1, color: '#000000' },
    { x: 0.2, y: 0.2, width: 0.6, height: 0.6, color: '#98643d' },
    { x: 0.4, y: 0.4, width: 0.2, height: 0.2, color: '#ffc800' },
  ],
  player: {
    body: [{ x: 0, y: 0, width: 1, height: 1, color: 'black' }],
    eye: [{ x: 0, y: 0, width: 1, height: 1, color: 'white' }],
  },
  zombie: {
    body: [{ x: 0, y: 0, width: 1, height: 1, color: '#a52a2a' }],
    eye: [{ x: 0, y: 0, width: 1, height: 1, color: '#ff0000' }],
  },
};
