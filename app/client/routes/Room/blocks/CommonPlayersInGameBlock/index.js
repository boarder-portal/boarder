import { Block } from 'dwayne';
import template from './index.pug';
import { colors } from '../../../../../config/constants.json';

class CommonPlayersInGameBlock extends Block {
  static template = template();

  COLORS = colors;
}

Block.block('CommonPlayersInGameBlock', CommonPlayersInGameBlock);
