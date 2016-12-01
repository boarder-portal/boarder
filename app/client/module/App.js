import { Block } from 'dwayne';

import '../routes/App';
import '../plugins/livereload';
import '../blocks';

Block.onEvalError = () => {
  // console.error('eval error:', err);
};
