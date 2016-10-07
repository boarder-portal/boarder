import { D, Router } from 'dwayne';
import BaseState from './base';
import LoginState from './login';
import { usersFetch } from '../fetchers';
import ForgotPasswordStateTemplate from '../views/states/forgot-password.pug';
import { images } from '../constants';

class ForgotPasswordState extends BaseState {
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
        successCaption.removeClass('hidden');
        sendToEmail.text(email);
      })
      .catch((res) => {
        console.log(res);
      })
      .then(() => {
        spinner.hide();
      });
  }

  onRender() {
    const {
      checkEmailCaption,
      spinnerContainer
    } = this;

    D(this).assign({
      spinner: spinnerContainer
        .child(images.loading)
        .addClass('auth-spinner')
        .hide()
    });

    checkEmailCaption
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
