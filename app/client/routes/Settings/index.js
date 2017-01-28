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

const wrap = Settings
  .wrap(makeRoute());

Block.block('Settings', wrap);
