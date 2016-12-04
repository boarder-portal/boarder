import { Block } from 'dwayne';
import template from './index.pug';

class MainContent extends Block {
  static template = template();
}

Block.register('MainContent', MainContent);
