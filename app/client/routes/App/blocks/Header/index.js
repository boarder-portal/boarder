import { Block } from 'dwayne';
import template from './index.pug';

class MainHeader extends Block {
  static template = template();
}

Block.register('MainHeader', MainHeader);
