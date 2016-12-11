import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Game extends Block {
  static template = template();
  static routerOptions = {
    name: 'game',
    parent: 'games',
    abstract: true,
    path: '/:game(hexagon|pexeso)'
  };
}

const wrap = Game
  .wrap(makeRoute());

Block.register('Game', wrap);
