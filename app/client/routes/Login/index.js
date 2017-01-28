import { D, Block, makeRoute } from 'dwayne';
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
    D(this).assign({
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

          D(TIME_TO_ALERT_AFTER_LOGIN)
            .timeout()
            .then(this.global.addNotConfirmedAlertIfNeeded);
        } else {
          this.loginError = true;
        }
      })
      .finally(() => {
        this.submitting = false;
      });
  };
}

const wrap = Login
  .wrap(makeRoute());

Block.block('Login', wrap);
