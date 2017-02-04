import { D, Block, array, switcher } from 'dwayne';
import template from './index.pug';
import SetGame from '../../';
import { games as gamesConfig } from '../../../../../config/constants.json';
import { createSVGPolygonPath } from '../../../../helpers';

const {
  set: {
    shapesTypes,
    colors,
    fillTypes
  }
} = gamesConfig;
const WaveStart = [696, 1];
const WavePath = [
  [-41, 7],
  [-118, 95],
  [-235, 74],
  [-87, -16],
  [-149, -66],
  [-246, -68],
  [-49, -1],
  [-85, 4],
  [-126, 33],
  [-66, 46],
  [-100, 146],
  [-86, 223],
  [7, 37],
  [24, 80],
  [63, 93],
  [35, 11],
  [70, -21],
  [109, -42],
  [36, -19],
  [85, -33],
  [126, -29],
  [40, 4],
  [77, 26],
  [117, 38],
  [45, 13],
  [90, 16],
  [137, 12],
  [87, -8],
  [147, -50],
  [188, -126],
  [51, -95],
  [22, -220],
  [-48, -208]
];
const originalWaveWidth = 770;
const originalWaveHeight = 359;

class SetCard extends Block {
  static template = template();

  WIDTH = 70;
  HEIGHT = 30;
  BORDER_WIDTH = 2;
  SHADED_WIDTH = 2;
  SHADED_FREQ = 7;
  array = array;
  shapesTypes = shapesTypes;
  colors = colors;
  fillTypes = fillTypes;
  fillPatternSwitcher = switcher()
    .case(fillTypes.EMPTY, 'rgba(0,0,0,0)')
    .case(fillTypes.FILLED, (color) => colors[color])
    .case(fillTypes.SHADED, (color) => `url(#shaded-${ color })`);

  constructor(opts) {
    super(opts);

    const {
      WIDTH,
      HEIGHT
    } = this;
    const R = HEIGHT / 2;
    const wavePath = D(WavePath)
      .map(([x, y]) => (
        [
          (x * WIDTH / originalWaveWidth).toFixed(1).replace(/\.0/, ''),
          (y * HEIGHT / originalWaveHeight).toFixed(1).replace(/\.0/, '')
        ].join(','))
      )
      .join(' ');
    const waveXStart = (WaveStart[0] * WIDTH / originalWaveWidth).toFixed(1);
    const waveYStart = (WaveStart[1] * HEIGHT / originalWaveHeight).toFixed(1);

    this.wavePath = `M${ waveXStart } ${ waveYStart }c${ wavePath }z`;
    this.diamondPath = createSVGPolygonPath([
      {
        x: 0,
        y: HEIGHT / 2
      },
      {
        x: WIDTH / 2,
        y: 0
      },
      {
        x: WIDTH,
        y: HEIGHT / 2
      },
      {
        x: WIDTH / 2,
        y: HEIGHT
      }
    ]);
    this.ovalPath = `
      M ${ WIDTH - R } 0
      A ${ R } ${ R }, 0, 1, 1, ${ WIDTH - R } ${ HEIGHT }
      H ${ R }
      A ${ R } ${ R }, 0, 1, 1, ${ R } 0
      Z
    `.replace(/\s*\n\s*/g, ' ');
  }

  afterConstruct() {
    this.watch('args.card', () => {
      this.card = this.args.card;
    });
  }
}

SetGame.block('SetCard', SetCard);
