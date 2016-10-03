import { D, Router } from 'dwayne';
import BaseState from './base';
import { fetch } from '../fetchers/users';
import LoginStateTemplate from '../views/states/login.pug';
import { images, store } from '../constants';

class LoginState extends BaseState {
  static stateName = 'login';
  static path = '/login';
  static template = LoginStateTemplate;

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

    fetch.login({ data })
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
    const { base } = this;
    const form = base.find('.login-form');
    const loginInput = form.find('[name="login"]');
    const passwordInput = form.find('[name="password"]');
    const checkCredentialsCaption = base.find('.check-credentials-caption');

    D(this).assign({
      form,
      loginInput,
      passwordInput,
      spinner: form.find('.auth-spinner-container')
        .child(images.loading)
        .addClass('auth-spinner')
        .hide(),
      successCaption: base.find('.auth-success-caption'),
      checkCredentialsCaption
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
