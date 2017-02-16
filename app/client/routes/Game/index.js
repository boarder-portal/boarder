import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { games as gamesConfig } from '../../../config/constants.json';

const games = _.keys(_.omit(gamesConfig, 'global'));

class Game extends Block {
  static template = template();
  static routerOptions = {
    name: 'game',
    parent: 'games',
    abstract: true,
    path: `/:game(${ games.join('|') })`
  };
}

Block.block('Game', Game.wrap(
  makeRoute()
));
