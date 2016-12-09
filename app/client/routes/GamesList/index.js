import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class GamesList extends Block {
  static template = template();
  static routerOptions = {
    name: 'games-list',
    parent: 'games',
    path: '/'
  };
}

const wrap = GamesList
  .wrap(makeRoute());

Block.register('GamesList', wrap);
