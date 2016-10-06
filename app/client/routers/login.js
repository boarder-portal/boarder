import { D, Router } from 'dwayne';
import BaseState from './base';
import { usersFetch } from '../fetchers';
import LoginStateTemplate from '../views/states/login.pug';
import { images, store } from '../constants';

class LoginState extends BaseState {
  static stateName = 'login';
  static path = '/login';
  static template = LoginStateTemplate;
  static elements = {
    form: {
      $: '.login-form',

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
      .then((res) => {
        const user = res.json;

        if (!user) {
          spinner.hide();
          checkCredentialsCaption.show();

          return;
        }

        Router.prototype._forceNew = true;
        store.user = user;

        form.hide();
        successCaption.removeClass('hidden');
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
      form,
      checkCredentialsCaption,
      spinnerContainer
    } = this;

    D(this).assign({
      spinner: spinnerContainer
        .child(images.loading)
        .addClass('auth-spinner')
        .hide()
    });

    checkCredentialsCaption
      .hide()
      .removeClass('hidden');

    form.on('submit', this.submit.bind(this));
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
