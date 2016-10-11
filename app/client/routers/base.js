import { D, Router, find } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';
import { i18n, changeLanguage } from '../i18n';
import { store } from '../constants';

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
    header: {
      $: '.main-header',

      profile: {
        $: '.profile',

        openProfileDropdown: '.fa-sort-down'
      }
    },
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

  authorize() {
    const header = find('.main-header');
    const profile = header.find('.profile');
    const $avatar = profile.find('.avatar');
    const $login = profile.find('.login');

    const {
      avatar,
      login
    } = store.user;

    header.addClass('authorized');

    $avatar.ref(avatar);
    $login.text(login);
  }

  constructor(props) {
    super(props);

    D(this.templateParams).assign({
      user: store.user
    });

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
