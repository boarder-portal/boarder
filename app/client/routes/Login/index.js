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
            .then(this.global.checkIfUserConfirmed);
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

Block.register('Login', wrap);
