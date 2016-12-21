import { Block } from 'dwayne';
import template from './index.pug';
import VirusWar from '../../';
import { games as gamesConfig, colors } from '../../../../../config/constants.json';

const {
  virus_war: {
    virusesTypes,
    virusesShapes
  }
} = gamesConfig;

class VirusCell extends Block {
  static template = template();

  SIZE = 24;
  BORDER_WIDTH = 2;
  virusesTypes = virusesTypes;
  virusesShapes = virusesShapes;
  color = colors[this.args.color];

  afterConstruct() {
    this.watchArgs('color', (newColor) => {
      this.color = colors[newColor];
    });
  }
}

VirusWar.register('VirusCell', VirusCell);
