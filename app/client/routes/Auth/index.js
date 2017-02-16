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

Block.block('Auth', Auth.wrap(
  makeRoute()
));
