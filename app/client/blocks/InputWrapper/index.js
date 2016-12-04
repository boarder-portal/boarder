import { Block } from 'dwayne';
import template from './index.pug';

class InputWrapper extends Block {
  static template = template();
}

Block.register('InputWrapper', InputWrapper);
