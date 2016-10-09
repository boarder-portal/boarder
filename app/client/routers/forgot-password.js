import { D, Router, Elem } from 'dwayne';
import AuthState from './auth';
import LoginState from './login';
import { usersFetch } from '../fetchers';
import ForgotPasswordStateTemplate from '../views/states/forgot-password.pug';

class ForgotPasswordState extends AuthState {
  static stateName = 'forgot-password';
  static path = '/forgot-password';
  static template = ForgotPasswordStateTemplate;
  static elements = {
    form: {
      $: '.forgot-password-form',

      $onSubmit: 'submit',

      emailInput: '[name="email"]'
    },
    checkEmailCaption: '.check-email-caption',
    successCaption: '.auth-success-caption',
    spinnerContainer: '.auth-spinner-container',
    sendToEmail: '.send-to-email'
  };

  submit(e) {
    e.preventDefault();

    const {
      form,
      spinner,
      emailInput,
      checkEmailCaption,
      successCaption,
      sendToEmail
    } = this;
    const email = emailInput.prop('value');

    checkEmailCaption.hide();
    spinner.show();

    usersFetch.forgotPassword({
      query: { email }
    })
      .then(({ json: success }) => {
        if (!success) {
          spinner.hide();
          checkEmailCaption.show();

          return;
        }

        form.hide();
        sendToEmail.text(email);
        successCaption.show();
      })
      .catch(() => {})
      .then(() => {
        spinner.hide();
      });
  }

  onRender() {
    const {
      checkEmailCaption,
      successCaption
    } = this;

    new Elem([successCaption, checkEmailCaption])
      .hide()
      .removeClass('hidden');
  }
}

Router.on('init', () => {
  D(LoginState.templateParams).deepAssign({
    forgotPasswordLink: ForgotPasswordState.buildURL()
  });
});

export default ForgotPasswordState;
