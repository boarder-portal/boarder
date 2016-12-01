import { D, Block, initApp, isFunction } from 'dwayne';
import { injectGlobals } from './helper';

import './module/App';
import './module/Home';

D(Block).forEach((block, name) => {
  const descriptor = D(Block).propertyDescriptor(name);

  if (isFunction(block) && descriptor.writable) {
    Block[name] = block.wrap(injectGlobals);
  }
});

initApp();
