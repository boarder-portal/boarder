import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class NotFound extends Block {
  static template = template();
}

Block.NotFound = NotFound
  .wrap(makeRoute({
    name: 'not-found',
    default: true
  }));
