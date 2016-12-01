import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

import './blocks/Header';
import './blocks/Content';
import './blocks/Footer';

class App extends Block {
  static template = template();
}

Block.App = App
  .wrap(makeRoute({
    name: 'root',
    root: true
  }));
