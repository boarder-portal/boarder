import { D, Elem, Router } from 'dwayne';
import { fetch } from '../fetchers/users';
import RegisterStateTemplate from '../views/states/register.pug';
import { images } from '../constants';

class RegisterState extends Router {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;
  static templateParams = {
    registerHeaderCaption: 'Registration',
    registerSuccessCaption: 'Success!',
    loginCaption: 'Login',
    emailCaption: 'Email',
    passwordCaption: 'Password',
    passwordRepeatCaption: 'Repeat password',
    registerActionCaption: 'Register'
  };

  passwordRepeatValidator(value) {
    if (value !== this.passwordInput.prop('value')) {
      throw new Error('Passwords do not match');
    }
  }

  findIcon(input) {
    return input
      .next()
      .find('.fa');
  }

  showIcon(input, wrong) {
    this.findIcon(input)
      .show()
      .toggleClass('fa-check', !wrong)
      .toggleClass('fa-close', wrong);
  }

  showErrors(input, message) {
    input.toggleAttr('invalid', message);
    input
      .up()
      .prev()
      .text(message || '');
  }

  register() {
    const {
      form,
      spinner,
      loginInput,
      emailInput,
      passwordInput,
      successCaption
    } = this;
    const data = {
      login: loginInput.prop('value'),
      email: emailInput.prop('value'),
      password: passwordInput.prop('value')
    };

    fetch.register({ data })
      .then((res) => {
        const {
          errors
        } = res.json;

        if (!errors) {
          form.hide();
          successCaption.removeClass('hidden');

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
      .catch((res) => {
        console.log(res);
      })
      .then(() => {
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
    const inputs = form.find('input[name]');
    const loaded = new Elem([loginInput, emailInput]);

    D(this).assign({
      form,
      loginInput,
      emailInput,
      passwordInput,
      passwordRepeatInput,
      spinner: form.find('.auth-spinner-container')
        .child(images.loading)
        .addClass('auth-spinner')
        .hide(),
      successCaption: base.find('.auth-success-caption'),
      fetchers: {
        login: {
          get: fetch.checkLogin,
          timeout: D(500).timeout()
        },
        email: {
          get: fetch.checkEmail,
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
    form.on('validate', this.onFormValidate.bind(this));
    submitInput.on('click', this.onPreSubmit.bind(this));
    inputs.on({
      input: this.onInputChange.bind(this),
      validate: this.onInputValidate.bind(this)
    });
  }
}

Router.on('init', () => {
  const registerURL = RegisterState.buildURL();

  D(Router.templateParams).deepAssign({
    urls: {
      register: registerURL
    },
    headerParams: {
      registerLink: 'Register'.link(registerURL)
    }
  });
});

export default RegisterState;
