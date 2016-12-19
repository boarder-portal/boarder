import { Block, initApp, find } from 'dwayne';
import { injectGlobals } from './helper';

import './module/App';
import './module/Auth';
import './module/Home';
import './module/NotFound';
import './module/Games';
import './module/Settings';

Block.getBlocks().forEach((block, name) => {
  Block.register(name, block.wrap(injectGlobals));
});

initApp('App', find('.app-root'));
