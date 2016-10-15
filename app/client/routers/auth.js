import { D, Router } from 'dwayne';
import BaseState from './base';
import AuthStateTemplate from '../views/states/auth.pug';
import { images } from '../constants';

class AuthState extends BaseState {
  static abstract = true;
  static stateName = 'auth';
  static template = AuthStateTemplate;

  onRender() {
    const { spinnerContainer } = this;

    D(this).assign({
      spinner: images.loading
        .hide()
        .into(spinnerContainer)
        .addClass('auth-spinner')
    });
  }
}

Router.on('init', () => {
  AuthState.on('render', ['register', 'reset-password'], ({ state }) => {
    const {
      inputs,
      passwordRepeatInput
    } = state;

    passwordRepeatInput.validate(state.passwordRepeatValidator.bind(state));
    inputs.validate(state.requiredValidator.bind(state));
  });
});

export default AuthState;
