import { Router } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';
import i18n from '../i18n';

class BaseState extends Router {
  static title = i18n.t('header_title');
  static template = BaseStateTemplate;
  static templateParams = {
    i18n,
    headerParams: {}
  };

  _forceNew = false;

  get forceNew() {
    /* eslint no-use-before-define: 0 */
    if (proto._forceNew) {
      proto._forceNew = false;

      return true;
    }

    return false;
  }
}

export default BaseState;
