import { Block, wrap, makeRoute } from 'dwayne';
import { includeGlobals } from '../../helper';
import template from './index.pug';
import './index.less';

class App extends Block {
  static template = template();
}

Block.App = wrap(App, [
  makeRoute({
    name: 'root',
    root: true
  }),
  includeGlobals
]);
