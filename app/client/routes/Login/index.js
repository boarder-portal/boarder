import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { TIME_TO_ALERT_AFTER_LOGIN } from '../../constants';

class Login extends Block {
  static template = template();
  static routerOptions = {
    name: 'login',
    parent: 'auth',
    path: '/login'
  };

  constructor(opts) {
    super(opts);

    this.reset();
  }

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.login'));
    }, 0);
  }

  beforeLeaveRoute() {
    this.reset();
  }

  reset() {
    _.assign(this, {
      submitting: false,
      loginSuccess: false,
      loginError: false,
      login: '',
      password: ''
    });
  }

  submit = (e) => {
    e.preventDefault();

    const {
      login,
      password
    } = this;
    const data = {
      login,
      password
    };

    this.submitting = true;
    this.loginError = false;

    this.global.usersFetch
      .login({ data })
      .then(({ json: user }) => {
        if (user) {
          this.loginSuccess = true;
          this.global.changeUser(user);

          setTimeout(
            this.global.addNotConfirmedAlertIfNeeded,
            TIME_TO_ALERT_AFTER_LOGIN
          );
        } else {
          this.loginError = true;
        }
      })
      .finally(() => {
        this.submitting = false;
      });
  };
}

Block.block('Login', Login.wrap(
  makeRoute()
));
