import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Auth extends Block {
  static template = template();
}

const wrap = Auth
  .wrap(makeRoute({
    name: 'auth',
    abstract: true,
    path: '/'
  }));

Block.register('Auth', wrap);
