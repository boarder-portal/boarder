import _ from 'lodash';
import { Block } from 'dwayne';
import template from './index.pug';
import SetGame from '../../';
import { games as gamesConfig } from '../../../../../config/constants.json';
import {
  createSVGPolygonPath,
  injectGlobals
} from '../../../../helpers';

const {
  set: {
    colors: COLORS
  }
} = gamesConfig;
const WAVE_START = [696, 1];
const WAVE_PATH = [
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
const ORIGINAL_WAVE_WIDTH = 770;
const ORIGINAL_WAVE_HEIGHT = 359;

class SetCard extends Block {
  static template = template();

  WIDTH = 70;
  HEIGHT = 30;
  BORDER_WIDTH = 2;
  SHADED_WIDTH = 2;
  SHADED_FREQ = 7;
  COLORS = COLORS;

  constructor(opts) {
    super(opts);

    const {
      WIDTH,
      HEIGHT
    } = this;
    const R = HEIGHT / 2;
    const wavePath = _(WAVE_PATH)
      .map(([x, y]) => (
        [
          (x * WIDTH / ORIGINAL_WAVE_WIDTH).toFixed(1).replace(/\.0/, ''),
          (y * HEIGHT / ORIGINAL_WAVE_HEIGHT).toFixed(1).replace(/\.0/, '')
        ].join(','))
      )
      .join(' ');
    const waveXStart = _.round(WAVE_START[0] * WIDTH / ORIGINAL_WAVE_WIDTH, 1);
    const waveYStart = _.round(WAVE_START[1] * HEIGHT / ORIGINAL_WAVE_HEIGHT, 1);

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

  fillPatternSwitcher(card) {
    const {
      color,
      fillType
    } = card;

    /* eslint indent: 0 */
    switch (fillType) {
      case 'EMPTY': {
        return 'rgba(0,0,0,0)';
      }

      case 'FILLED': {
        return COLORS[color];
      }

      case 'SHADED': {
        return `url(#shaded-${ color })`;
      }
    }
  }
}

SetGame.block('SetCard', SetCard.wrap(
  injectGlobals
));
