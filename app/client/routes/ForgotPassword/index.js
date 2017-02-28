import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';

class ForgotPassword extends Block {
  static template = template();
  static routerOptions = {
    name: 'forgot-password',
    parent: 'auth',
    path: '/forgot_password'
  };

  constructor(opts) {
    super(opts);

    this.reset();
  }

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.forgot_password'));
    }, 0);
  }

  beforeLeaveRoute() {
    this.reset();
  }

  reset() {
    _.assign(this, {
      submitting: false,
      fetchSuccess: false,
      emailError: false,
      email: ''
    });
  }

  submit = (e) => {
    e.preventDefault();

    const { email } = this;
    const query = { email };

    this.submitting = true;
    this.emailError = false;

    this.globals.usersFetch
      .forgotPassword({ query })
      .then(({ json: success }) => {
        if (success) {
          this.fetchSuccess = true;
        } else {
          this.emailError = true;
        }
      })
      .finally(() => {
        this.submitting = false;
      });
  };
}

Block.block('ForgotPassword', ForgotPassword.wrap(
  makeRoute()
));
