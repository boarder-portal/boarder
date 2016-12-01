import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Auth extends Block {
  static template = template();
}

Block.Auth = Auth
  .wrap(makeRoute({
    name: 'auth',
    abstract: true,
    path: '/'
  }));
