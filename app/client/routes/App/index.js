import { Block, wrap, makeRoute } from 'dwayne';
import template from './index.pug';

import './blocks/Header';
import './blocks/Content';
import './blocks/Footer';

class App extends Block {
  static template = template();
}

Block.App = wrap(App, [
  makeRoute({
    name: 'root',
    root: true
  })
]);
