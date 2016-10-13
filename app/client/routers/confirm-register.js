import { Router } from 'dwayne';
import BaseState from './base';
import HomeState from './home';
import { Alert } from '../helpers';
import { REGISTER_CONFIRMED_ALERT_DURATION } from '../constants';
import ConfirmedAlertTemplate from '../views/alerts/confirmed.pug';

class ConfirmRegisterState extends BaseState {
  static stateName = 'confirm-register';
  static path = '/?confirmRegister(true)';

  onBeforeLoad(e) {
    const removeListener = Router.on('render', () => {
      removeListener();

      new Alert(ConfirmedAlertTemplate, REGISTER_CONFIRMED_ALERT_DURATION, 'success', 'low');
    });

    e.redirectTo(HomeState.buildURL());
  }
}

export default ConfirmRegisterState;
