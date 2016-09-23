import { D, Router } from 'dwayne';
import LoginStateTemplate from '../views/states/login.pug';

class LoginState extends Router {
  static stateName = 'login';
  static path = '/login';
  static template = LoginStateTemplate;
  static templateParams = {};
}

Router.on('init', () => {
  const loginURL = LoginState.buildURL();

  D(Router.templateParams).deepAssign({
    urls: {
      login: loginURL
    },
    headerParams: {
      loginLink: 'Login'.link(loginURL)
    }
  });
});

export default LoginState;
