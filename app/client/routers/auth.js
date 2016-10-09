import { D } from 'dwayne';
import BaseState from './base';
import AuthStateTemplate from '../views/states/auth.pug';
import { images } from '../constants';

class AuthState extends BaseState {
  static abstract = true;
  static stateName = 'auth';
  static template = AuthStateTemplate;
  static elements = {
    inputs: 'html',
    passwordRepeatInput: 'html',
    spinnerContainer: 'html'
  };

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
      authStateName
    } = this;

    input.toggleAttr('invalid', message);
    input
      .up()
      .prev()
      .text(i18n.t(`${ authStateName }.validations.${ message }`));
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

  onRender() {
    const { spinnerContainer } = this;

    D(this).assign({
      spinner: spinnerContainer
        .child(images.loading)
        .addClass('auth-spinner')
        .hide()
    });
  }
}

AuthState.on('render', ['register', 'reset-password'], ({ state }) => {
  const {
    inputs,
    passwordRepeatInput
  } = state;

  passwordRepeatInput.validate(state.passwordRepeatValidator.bind(state));
  inputs.validate(state.requiredValidator.bind(state));
});

export default AuthState;
