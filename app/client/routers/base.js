import { D, Router, find } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';
import { i18n, changeLanguage } from '../i18n';
import { usersFetch } from '../fetchers';
import { store, images } from '../constants';

const languages = [
  {
    lang: 'en',
    caption: 'English'
  },
  {
    lang: 'ru',
    caption: 'Русский'
  }
];
let fetching = false;

class BaseState extends Router {
  static stateName = 'base';
  static path = '/';
  static title = i18n.t('header.title');
  static template = BaseStateTemplate;
  static templateParams = {
    i18n,
    languages,
    currentLang: D(languages).find(({ lang }) => lang === i18n.locale).value.caption,
    headerParams: {}
  };
  static elements = {
    header: {
      $: '.main-header',

      profile: {
        $: '.profile',

        dropdown: {
          $: '.profile-dropdown',

          logout: {
            $: '.logout',

            $onClick: 'logOut'
          }
        }
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

  constructor(props) {
    super(props);

    D(this.templateParams).assign({
      user: store.user
    });

    this.i18n = i18n;
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

    if (avatar) {
      $avatar.ref(avatar);
    }

    $login.text(login);
  }

  logOut() {
    if (fetching) {
      return;
    }

    const {
      logout,
      logoutSpinner
    } = this;

    fetching = true;

    logoutSpinner.show();
    usersFetch.logout()
      .then(() => {
        logout.closeDropdown();

        location.href = this.homeLink;
      })
      .catch(() => {})
      .then(() => {
        logoutSpinner.hide();
      });
  }

  onLanguageClick(e) {
    const target = D(e.target);
    const lang = target.data('lang');

    changeLanguage(lang);
  }
}

const removeListener = BaseState.on('render', ({ state }) => {
  removeListener();

  const { logout } = state;

  D(state).assign({
    logoutSpinner: images.loading
      .hide()
      .into(logout)
      .addClass('logout-spinner')
  });
});

const proto = BaseState.prototype;

export default BaseState;
