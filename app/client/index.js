import { Block, initApp, find } from 'dwayne';
import { injectGlobals } from './helpers';

import './modules/App';
import './modules/Auth';
import './modules/Home';
import './modules/NotFound';
import './modules/Games';
import './modules/Settings';

Block.getBlocks().forEach((block, name) => {
  Block.register(name, block.wrap(injectGlobals));
});

initApp('App', find('.app-root'));
