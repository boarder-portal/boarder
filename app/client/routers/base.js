import { D, Router } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';

const proto = Router.prototype;

D(Router).deepAssign({
  title: 'Boarder',
  template: BaseStateTemplate,
  templateParams: {
    headerParams: {}
  }
});
D(proto)
  .deepAssign({
    _forceNew: false
  })
  .get('forceNew', () => {
    if (proto._forceNew) {
      proto._forceNew = false;

      return true;
    }

    return false;
  });
