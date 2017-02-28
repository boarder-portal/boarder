import { Block, makeRoute } from 'dwayne';
import { ALERTS } from '../../constants';

class ConfirmRegister extends Block {
  static template = '';
  static routerOptions = {
    name: 'confirm-register',
    parent: 'auth',
    path: '/?confirm_register(true)'
  };

  beforeLoadRoute() {
    setTimeout(() => {
      this.globals.addAlert(ALERTS.USER_CONFIRMED);
      this.router.redirect('home');
    }, 100);
  }
}

Block.block('ConfirmRegister', ConfirmRegister.wrap(
  makeRoute()
));
