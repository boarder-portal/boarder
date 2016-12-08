import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Auth extends Block {
  static template = template();
  static routerOptions = {
    name: 'auth',
    abstract: true,
    path: '/'
  };
}

const wrap = Auth
  .wrap(makeRoute());

Block.register('Auth', wrap);
