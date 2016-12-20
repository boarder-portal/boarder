import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

const games = [
  'hexagon',
  'set',
  'pexeso',
  'virus_war'
];

class Game extends Block {
  static template = template();
  static routerOptions = {
    name: 'game',
    parent: 'games',
    abstract: true,
    path: `/:game(${ games.join('|') })`
  };
}

const wrap = Game
  .wrap(makeRoute());

Block.register('Game', wrap);
