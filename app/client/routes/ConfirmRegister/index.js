import { D, Block, makeRoute } from 'dwayne';
import {
  alertTypes,
  REGISTER_CONFIRMED_ALERT_DURATION
} from '../../constants';

class ConfirmRegister extends Block {
  static template = '';
  static routerOptions = {
    name: 'confirm-register',
    parent: 'auth',
    path: '/?confirm_register(true)'
  };

  beforeLoadRoute() {
    D(100)
      .timeout()
      .then(() => {
        this.global.addAlert({
          type: alertTypes.USER_CONFIRMED,
          level: 'success',
          priority: 'low',
          duration: REGISTER_CONFIRMED_ALERT_DURATION
        });
        this.router.redirect('home');
      });
  }
}

const wrap = ConfirmRegister
  .wrap(makeRoute());

Block.register('ConfirmRegister', wrap);
