import { D, Router } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';

D(Router).deepAssign({
  title: 'Boarder',
  template: BaseStateTemplate,
  templateParams: {
    headerParams: {}
  }
});
