import { D, Block, initApp, isFunction } from 'dwayne';
import { injectGlobals } from './helper';

import './module/App';
import './module/Home';

D(Block).forEach((block, name) => {
  if (isFunction(block)) {
    Block[name] = injectGlobals(block);
  }
});

initApp();
