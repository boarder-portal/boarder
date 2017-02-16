import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class Settings extends Block {
  static template = template();
  static routerOptions = {
    name: 'settings',
    abstract: true,
    path: '/settings'
  };
}

Block.block('Settings', Settings.wrap(
  makeRoute()
));
