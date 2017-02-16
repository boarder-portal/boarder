import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class GamesList extends Block {
  static template = template();
  static routerOptions = {
    name: 'games-list',
    parent: 'games',
    path: '/'
  };

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.games'));
    }, 0);
  }
}

Block.block('GamesList', GamesList.wrap(
  makeRoute()
));
