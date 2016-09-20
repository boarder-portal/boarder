import { D, Router } from 'dwayne';
import BaseState from '../views/states/base.pug';

D(Router).deepAssign({
  title: 'Boarder',
  template: BaseState
});
