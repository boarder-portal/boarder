import { D, Elem, Router, doc } from 'dwayne';
import BaseState from './base';
import { usersFetch } from '../fetchers';
import RegisterStateTemplate from '../views/states/register.pug';
import { images } from '../constants';

class RegisterState extends BaseState {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;

  requiredValidator(value) {
    if (!value) {
      throw new Error('field_must_not_be_empty');
    }
  }

  emailValidator(value) {
    const { testEmailInput } = this;

    testEmailInput.prop('value', value);

    if (testEmailInput.validate()) {
      throw new Error('value_is_not_email');
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
    input.toggleAttr('invalid', message);
    input
      .up()
      .prev()
      .text(this.i18n.t(`register.validations.${ message }`));
  }

  showIcon(input, wrong) {
    this.findIcon(input)
      .show()
      .toggleClass('fa-check', !wrong)
      .toggleClass('fa-close', wrong);
  }

  register() {
    const {
      form,
      spinner,
      loginInput,
      emailInput,
      passwordInput,
      submitInput,
      successCaption,
      sendToEmail
    } = this;
    const email = emailInput.prop('value');
    const data = {
      login: loginInput.prop('value'),
      email,
      password: passwordInput.prop('value')
    };

    submitInput.attr('disabled', '');

    usersFetch.register({ data })
      .then(({ json }) => {
        const { errors } = json;

        if (!errors) {
          form.hide();
          successCaption.removeClass('hidden');
          sendToEmail.text(email);

          return;
        }

        D(errors).forEach(({ field, message }) => {
          form
            .find(`[name="${ field }"`)
            .up()
            .prev()
            .text(D(message).capitalizeFirst());
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .then(() => {
        submitInput.removeAttr('disabled');
        spinner.hide();
      });
  }

  onInputChange({ target }) {
    D(target).validate();
  }

  onFormValidate({ target, valid }) {
    const {
      form,
      spinner
    } = this;

    if (target === form.$[0]) {
      this.validated = true;

      if (valid) {
        this.registering = true;

        spinner.show();
        this.register();
      }
    }
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

      if (error || this.registering) {
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

  onPreSubmit(e) {
    e.preventDefault();

    this.form.validate();
  }

  onRender() {
    const { base } = this;
    const form = base.find('.register-form');
    const loginInput = form.find('[name="login"]');
    const emailInput = form.find('[name="email"]');
    const passwordInput = form.find('[name="password"]');
    const passwordRepeatInput = form.find('[name="password-repeat"]');
    const submitInput = form.find('[type="submit"]');
    const sendToEmail = base.find('.send-to-email');
    const inputs = form.find('input[name]');
    const loaded = new Elem([loginInput, emailInput]);
    const testEmailInput = doc.input('$type(email)');

    D(this).assign({
      form,
      testEmailInput,
      sendToEmail,
      loginInput,
      emailInput,
      passwordInput,
      passwordRepeatInput,
      submitInput,
      spinner: form.find('.auth-spinner-container')
        .child(images.loading)
        .addClass('auth-spinner')
        .hide(),
      successCaption: base.find('.auth-success-caption'),
      fetchers: {
        login: {
          get: usersFetch.checkLogin,
          timeout: D(500).timeout()
        },
        email: {
          get: usersFetch.checkEmail,
          timeout: D(500).timeout()
        }
      }
    });

    loaded
      .next()
      .forEach((elem) => {
        D(elem)
          .child(images.loading)
          .addClass('register-input-spinner')
          .hide();
      });

    passwordRepeatInput.validate(this.passwordRepeatValidator.bind(this));
    inputs.validate(this.requiredValidator.bind(this));
    emailInput.validate(this.emailValidator.bind(this));
    form.on('validate', this.onFormValidate.bind(this));
    submitInput.on('click', this.onPreSubmit.bind(this));
    inputs.on({
      input: this.onInputChange.bind(this),
      validate: this.onInputValidate.bind(this)
    });
  }
}

Router.on('init', () => {
  D(BaseState.templateParams).deepAssign({
    headerParams: {
      registerLink: RegisterState.buildURL()
    }
  });
});

export default RegisterState;
