import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class NotFound extends Block {
  static template = template();
  static routerOptions = {
    name: 'not-found',
    default: true,
    path: '/not_found'
  };

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.not_found'));
    }, 0);
  }
}

Block.block('NotFound', NotFound.wrap(
  makeRoute()
));
