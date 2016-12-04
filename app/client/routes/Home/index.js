import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Home extends Block {
  static template = template();
}

const wrap = Home
  .wrap(makeRoute({
    name: 'home',
    path: '/'
  }));

Block.register('Home', wrap);
