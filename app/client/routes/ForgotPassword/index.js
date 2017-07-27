import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { errors } from '../../../config/constants.json';

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
      .then(() => {
        this.fetchSuccess = true;
      }, (err) => {
        const message = err.response.data;

        if (
          message === errors.WRONG_EMAIL
          || message === errors.NO_SUCH_EMAIL_REGISTERED
        ) {
          this.emailError = true;
        } else {
          throw err;
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
