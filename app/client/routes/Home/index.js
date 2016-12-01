import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Home extends Block {
  static template = template();
}

Block.Home = Home
  .wrap(makeRoute({
    name: 'home',
    path: '/'
  }));
