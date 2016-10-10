import { D, Router } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';
import { i18n, changeLanguage } from '../i18n';

class BaseState extends Router {
  static stateName = 'base';
  static path = '/';
  static title = i18n.t('header.title');
  static template = BaseStateTemplate;
  static templateParams = {
    i18n,
    headerParams: {}
  };
  static elements = {
    languages: {
      $: '.main-footer .languages .language',

      $onClick: 'onLanguageClick'
    }
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

  constructor(props) {
    super(props);

    this.i18n = i18n;
  }

  onLanguageClick(e) {
    const target = D(e.target);
    const lang = target.data('lang');

    changeLanguage(lang);
  }
}

const proto = BaseState.prototype;

export default BaseState;
