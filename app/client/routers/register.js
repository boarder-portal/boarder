import { D, Elem, Router } from 'dwayne';
import { fetch } from '../fetchers/users';
import RegisterStateTemplate from '../views/states/register.pug';
import { images } from '../constants';

class RegisterState extends Router {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;
  static templateParams = {
    registerCaption: 'Registration',
    registerSuccessCaption: 'Success!',
    loginCaption: 'Login',
    emailCaption: 'Email',
    passwordCaption: 'Password',
    passwordRepeatCaption: 'Repeat password',
    registerActionCaption: 'Register'
  };

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

  findErrorCaption(input) {
    return input
      .up()
      .prev();
  }

  validate(input) {
    const errors = input.validate();
    const name = input.attr('name');

    if (this.validated) {
      this.findErrorCaption(input)
        .text(
          errors
            ? errors[name].message
            : ''
        );
    }

    this.showIcon(input, errors);

    return errors;
  }

  showErrors(input, message) {
    input
      .up()
      .prev()
      .text(message);
  }

  register() {
    const {
      form,
      spinner
    } = this;
    const data = {
      login: this.loginInput.prop('value'),
      email: this.emailInput.prop('value'),
      password: this.passwordInput.prop('value')
    };

    fetch.register({ data })
      .then((res) => {
        const {
          errors
        } = res.json;

        if (!errors) {
          form.hide();
          this.successCaption.removeClass('hidden');

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

  onPasswordRepeatValidate(value) {
    if (value !== this.passwordInput.prop('value')) {
      throw new Error('Passwords do not match');
    }
  }

  onPreSubmit(e) {
    e.preventDefault();

    const {
      form,
      spinner
    } = this;

    this.validated = true;

    const errors = form.validate();

    if (!errors) {
      spinner.show();

      return this.register();
    }

    this.inputs.forEach((input) => {
      input = D(input);

      if (errors[input.attr('name')]) {
        this.validate(input);
      }
    });
  }

  onPasswordInputsChange({ target }) {
    target = D(target);

    const name = target.attr('name');

    this.validate(target);

    if (name === 'password' && this.repeatValidated) {
      this.validate(this.passwordRepeatInput);
    }

    if (name === 'password-repeat') {
      this.repeatValidated = true;
    }
  }

  onLoadedInputChange({ target }) {
    target = D(target);

    const onInput = target.prop('onInput');

    onInput.timeout.abort();

    const spinner = target
      .next()
      .find('.register-input-spinner');
    const errors = this.validate(target);

    if (errors) {
      spinner.hide();

      return;
    }

    const timeout = onInput.timeout = D(500).timeout();

    timeout.catch(() => {});
    this.findIcon(target).hide();
    this.findErrorCaption(target).html('');
    spinner.show();

    timeout.then(() => {
      const fetch = onInput.timeout = onInput.get({
        query: {
          [target.attr('name')]: target.prop('value')
        }
      });

      fetch
        .then(({ json: wrong }) => {
          this.showIcon(target, wrong);
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

  onRender() {
    const { base } = this;
    const form = base.find('.register-form');
    const loginInput = form.find('[name="login"]');
    const emailInput = form.find('[name="email"]');
    const passwordInput = form.find('[name="password"]');
    const passwordRepeatInput = form.find('[name="password-repeat"]');
    const submitInput = form.find('[type="submit"]');
    const loaded = new Elem([loginInput, emailInput]);
    const passwords = new Elem([passwordInput, passwordRepeatInput]);

    D(this).assign({
      form,
      loginInput,
      emailInput,
      passwordInput: form.find('[name="password"]'),
      passwordRepeatInput: form.find('[name="password-repeat"]'),
      inputs: form.find('input[name]'),
      spinner: form.find('.register-spinner-container')
        .child(images.loading)
        .addClass('register-spinner')
        .hide(),
      successCaption: base.find('.register-success-caption')
    });

    loginInput.prop('onInput', {
      get: fetch.checkLogin,
      timeout: D(500).timeout()
    });
    emailInput.prop('onInput', {
      get: fetch.checkEmail,
      timeout: D(500).timeout()
    });

    loaded
      .next()
      .forEach((elem) => {
        D(elem)
          .child(images.loading)
          .addClass('register-input-spinner')
          .hide();
      });

    passwordRepeatInput.validate(this.onPasswordRepeatValidate.bind(this));
    submitInput.on('click', this.onPreSubmit.bind(this));
    loaded.on('input', this.onLoadedInputChange.bind(this));
    passwords.on('input', this.onPasswordInputsChange.bind(this));
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
