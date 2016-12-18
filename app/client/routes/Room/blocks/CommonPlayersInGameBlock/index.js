import { Block } from 'dwayne';
import template from './index.pug';
import { colors } from '../../../../../config/constants.json';

class CommonPlayersInGameBlock extends Block {
  static template = template();

  colors = colors;
}

Block.register('CommonPlayersInGameBlock', CommonPlayersInGameBlock);
