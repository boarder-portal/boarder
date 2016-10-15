import { D, Elem, Router, doc } from 'dwayne';
import AuthState from './auth';
import BaseState from './base';
import LoginState from './login';
import { usersFetch } from '../fetchers';
import RegisterStateTemplate from '../views/states/register.pug';
import { images } from '../constants';

class RegisterState extends AuthState {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;
  static elements = {
    form: {
      $: '.register-form',

      $onValidate: 'onFormValidate',

      inputs: {
        $: 'input[name]',

        $onInput: 'onInputChange',
        $onValidate: 'onInputValidate'
      },
      loginInput: '[name="login"]',
      emailInput: '[name="email"]',
      passwordInput: '[name="password"]',
      passwordRepeatInput: '[name="password-repeat"]',
      submitInput: {
        $: 'input[type="submit"]',

        $onClick: 'onPreSubmit'
      },
      spinnerContainer: '.auth-spinner-container'
    },
    sendToEmail: '.send-to-email',
    successCaption: {
      $: '.auth-success-caption',

      sendOneMore: {
        $: '.send-one-more',

        $onClick: 'sendOneMore'
      }
    }
  };

  stateName = 'register';

  emailValidator(value) {
    const { testEmailInput } = this;

    testEmailInput.prop('value', value);

    if (testEmailInput.validate()) {
      throw new Error('value_is_not_email');
    }
  }

  sendOneMore() {
    const {
      fetchers,
      email
    } = this;

    fetchers.sendOneMore.abort();

    fetchers.sendOneMore = usersFetch
      .sendOneMore({
        query: { email }
      })
      .catch(() => {});
  }

  submit() {
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

    this.email = email;

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
          const target = form.find(`[name="${ field }"`);

          this.showIcon(target, true);
          this.showErrors(target, message);
        });
      })
      .catch(() => {})
      .then(() => {
        this.fetching = false;

        submitInput.removeAttr('disabled');
        spinner.hide();
      });
  }

  onRender() {
    const {
      loginInput,
      emailInput
    } = this;
    const loaded = new Elem([loginInput, emailInput]);
    const testEmailInput = doc.input('$type(email)');

    D(this).assign({
      testEmailInput,
      fetchers: {
        login: {
          get: usersFetch.checkLogin,
          timeout: D(500).timeout()
        },
        email: {
          get: usersFetch.checkEmail,
          timeout: D(500).timeout()
        },
        sendOneMore: D(0).timeout()
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

    emailInput.validate(this.emailValidator.bind(this));
  }
}

Router.on('init', () => {
  const registerLink = RegisterState.buildURL();

  D(BaseState.templateParams).deepAssign({
    headerParams: { registerLink }
  });

  D(LoginState.templateParams).deepAssign({ registerLink });
});

export default RegisterState;
