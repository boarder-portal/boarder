import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Games extends Block {
  static template = template();
  static routerOptions = {
    name: 'games',
    abstract: true,
    path: '/games'
  };
}

Block.block('Games', Games.wrap(
  makeRoute()
));
