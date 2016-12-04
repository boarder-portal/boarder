import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class NotFound extends Block {
  static template = template();
}

const wrap = NotFound
  .wrap(makeRoute({
    name: 'not-found',
    default: true
  }));

Block.register('NotFound', wrap);
