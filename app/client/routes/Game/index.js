import { D, Block, makeRoute, self } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const games = D(gamesConfig)
  .map(self)
  .delete('global')
  .keys();

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
