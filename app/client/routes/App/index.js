import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

import './blocks/Header';
import './blocks/Content';
import './blocks/Footer';

class App extends Block {
  static template = template();
}

const wrap = App
  .wrap(makeRoute({
    name: 'root',
    abstract: true,
    root: true
  }));

Block.register('App', wrap);
