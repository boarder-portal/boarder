import { D, Router, Elem } from 'dwayne';
import BaseState from './base';
import AuthState from './auth';
import { usersFetch } from '../fetchers';
import LoginStateTemplate from '../views/states/login.pug';
import { store } from '../constants';

class LoginState extends AuthState {
  static stateName = 'login';
  static path = '/login';
  static template = LoginStateTemplate;
  static elements = {
    form: {
      $: '.login-form',

      $onSubmit: 'submit',

      loginInput: '[name="login"]',
      passwordInput: '[name="password"]'
    },
    checkCredentialsCaption: '.check-credentials-caption',
    successCaption: '.auth-success-caption',
    spinnerContainer: '.auth-spinner-container'
  };

  submit(e) {
    e.preventDefault();

    const {
      form,
      spinner,
      loginInput,
      passwordInput,
      checkCredentialsCaption,
      successCaption
    } = this;

    const data = {
      login: loginInput.prop('value'),
      password: passwordInput.prop('value')
    };

    checkCredentialsCaption.hide();
    spinner.show();

    usersFetch.login({ data })
      .then(({ json: user }) => {
        if (!user) {
          spinner.hide();
          checkCredentialsCaption.show();

          return;
        }

        BaseState.prototype._forceNew = true;
        store.user = user;

        form.hide();
        successCaption.show();
      })
      .catch(() => {})
      .then(() => {
        spinner.hide();
      });
  }

  onRender() {
    const {
      checkCredentialsCaption,
      successCaption
    } = this;

    new Elem([successCaption, checkCredentialsCaption])
      .hide()
      .removeClass('hidden');
  }
}

Router.on('init', () => {
  D(BaseState.templateParams).deepAssign({
    headerParams: {
      loginLink: LoginState.buildURL()
    }
  });
});

export default LoginState;
