import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class NotFound extends Block {
  static template = template();
  static routerOptions = {
    name: 'not-found',
    default: true
  };
}

const wrap = NotFound
  .wrap(makeRoute());

Block.register('NotFound', wrap);
