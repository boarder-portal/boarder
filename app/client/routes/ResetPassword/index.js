import { D, Block, makeRoute } from 'dwayne';
import template from './index.pug';

class ResetPassword extends Block {
  static template = template();
  static routerOptions = {
    name: 'reset-password',
    parent: 'auth',
    path: '/reset_password'
  };

  constructor(opts) {
    super(opts);

    this.reset();
  }

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.reset_password'));
    }, 0);
  }

  beforeLeaveRoute() {
    this.reset();
  }

  reset() {
    D(this).assign({
      attemptedToSubmit: false,
      submitting: false,
      resetPasswordSuccess: false,
      emailError: false,
      password: '',
      passwordRepeat: ''
    });
  }

  submit = (e) => {
    e.preventDefault();

    this.attemptedToSubmit = true;

    if (this.form.validate()) {
      return;
    }

    const {
      args: {
        route: {
          query: {
            email,
            token
          }
        }
      },
      password
    } = this;
    const data = {
      email,
      token,
      password
    };

    this.submitting = true;
    this.emailError = false;

    this.global.usersFetch
      .resetPassword({ data })
      .then(({ json: success }) => {
        if (success) {
          this.resetPasswordSuccess = true;
        } else {
          this.emailError = true;
        }
      })
      .finally(() => {
        this.submitting = false;
      });
  };
}

const wrap = ResetPassword
  .wrap(makeRoute());

Block.register('ResetPassword', wrap);
