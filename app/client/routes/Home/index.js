import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Home extends Block {
  static template = template();
  static routerOptions = {
    name: 'home',
    path: '/'
  };
}

const wrap = Home
  .wrap(makeRoute());

Block.register('Home', wrap);
