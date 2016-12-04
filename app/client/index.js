import { Block, initApp } from 'dwayne';
import { injectGlobals } from './helper';

import './module/App';
import './module/Auth';
import './module/Home';
import './module/NotFound';

Block.getBlocks().forEach((block, name) => {
  Block.register(name, block.wrap(injectGlobals));
});

initApp();
