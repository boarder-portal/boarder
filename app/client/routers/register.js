import { D, Router } from 'dwayne';
import RegisterStateTemplate from '../views/states/register.pug';

class RegisterState extends Router {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;
  static templateParams = {
    registerCaption: 'Registration',
    emailCaption: 'Email',
    passwordCaption: 'Password',
    passwordRepeatCaption: 'Repeat password',
    registerActionCaption: 'Register'
  };
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
