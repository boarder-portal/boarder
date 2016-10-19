import { D, Router, find } from 'dwayne';
import BaseStateTemplate from '../views/states/base.pug';
import { i18n, changeLanguage } from '../i18n';
import { usersFetch } from '../fetchers';
import { store, images } from '../constants';

const languages = [
  {
    lang: 'en',
    flag: 'gb',
    caption: 'English'
  },
  {
    lang: 'ru',
    flag: 'ru',
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

          settingsLink: {
            $: '.settings-link',

            $onClick: 'goToSettings'
          },
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
    const $login = profile.find('.login');

    const { login } = store.user;

    header.addClass('authorized');

    this.changeAvatar();

    $login.text(login);
  }

  changeAvatar() {
    const header = find('.main-header');
    const profile = header.find('.profile');
    const $avatar = profile.find('.avatar');

    const { avatar } = store.user;

    if (avatar) {
      $avatar.ref(avatar);
    } else {
      $avatar.removeAttr('src');
    }
  }

  goToSettings({ target }) {
    D(target).closeDropdown();
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

  onLanguageClick({ target }) {
    target = D(target).closest('.language');

    changeLanguage(target.data('lang'));
  }

  requiredValidator(value) {
    if (!value) {
      throw new Error('field_must_not_be_empty');
    }
  }

  passwordRepeatValidator(value) {
    if (value !== this.passwordInput.prop('value')) {
      throw new Error('passwords_do_not_match');
    }
  }

  findIcon(input) {
    return input
      .next()
      .find('.fa');
  }

  showErrors(input, message) {
    const {
      i18n,
      stateName
    } = this;

    input.toggleAttr('invalid', message);
    input
      .up()
      .prev()
      .text(i18n.t(`${ stateName }.validations.${ message }`));
  }

  showIcon(input, wrong) {
    this.findIcon(input)
      .show()
      .toggleClass('fa-check', !wrong)
      .toggleClass('fa-times', wrong);
  }

  onInputChange({ target }) {
    D(target).validate();
  }

  onInputValidate({ target, error }) {
    target = D(target);

    const name = target.attr('name');

    if (name === 'password' && this.repeatValidated) {
      this.passwordRepeatInput.validate();
    }

    if (name === 'password-repeat') {
      this.repeatValidated = true;
    }

    if (this.validated) {
      this.showErrors(target, error && error.message);
    }

    this.showIcon(target, error);

    if (name === 'login' || name === 'email') {
      const fetcher = this.fetchers[name];

      fetcher.timeout.abort();

      const spinner = target
        .next()
        .find('.register-input-spinner');

      if (error || this.fetching) {
        spinner.hide();

        return;
      }

      const timeout = fetcher.timeout = D(500).timeout();

      this.findIcon(target).hide();
      this.showErrors(target, '');
      spinner.show();

      timeout.then(() => {
        const fetch = fetcher.timeout = fetcher.get({
          query: {
            [target.attr('name')]: target.prop('value')
          }
        });

        fetch
          .then(({ json: { error } }) => {
            this.showIcon(target, error);

            if (this.validated) {
              this.showErrors(target, error || '');
            }
          })
          .catch((err) => {
            if (err.message === 'Request was aborted') {
              throw err;
            }

            console.log(err);
          })
          .then(() => {
            spinner.hide();
          }, () => {});
      }, () => {});
    }
  }

  onFormValidate({ target, valid }) {
    const {
      form,
      spinner
    } = this;

    if (target === form.$[0]) {
      this.validated = true;

      if (valid) {
        this.fetching = true;

        spinner.show();
        this.submit();
      }
    }
  }

  onPreSubmit(e) {
    e.preventDefault();

    this.form.validate();
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

export default BaseState;
