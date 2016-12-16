import { Block } from 'dwayne';
import template from './index.pug';
import VirusWar from '../..';
import { games as gamesConfig } from '../../../../../config/constants.json';

const {
  virusWar: {
    virusesTypes,
    virusesShapes
  }
} = gamesConfig;

class VirusCell extends Block {
  static template = template();

  virusesTypes = virusesTypes;
  virusesShapes = virusesShapes;
}

VirusWar.register('VirusCell', VirusCell);
