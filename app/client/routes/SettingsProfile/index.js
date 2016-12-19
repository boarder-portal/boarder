import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class SettingsProfile extends Block {
  static template = template();
  static routerOptions = {
    name: 'settings-profile',
    parent: 'settings',
    path: '/profile'
  };
}

const wrap = SettingsProfile
  .wrap(makeRoute());

Block.register('SettingsProfile', wrap);
