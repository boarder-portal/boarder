import { Block, makeRoute } from 'dwayne';
import {
  requiredValidator,
  passwordRepeatValidator,
  emailValidator
} from '../../helper';
import template from './index.pug';

class Register extends Block {
  static template = template();

  requiredValidator = requiredValidator;
  passwordRepeatValidator = passwordRepeatValidator;
  emailValidator = emailValidator;

  beforeLoad() {
    this.validated = false;
    this.repeatValidated = false;
  }

  onInput({ target }) {
    D(target).validate();
  }

  onInputValidate = ({ target, error }) => {
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
  };
}

Block.Register = Register
  .wrap(makeRoute({
    name: 'register',
    parent: 'auth',
    path: '/register'
  }));
