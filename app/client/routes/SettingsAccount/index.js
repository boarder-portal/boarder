import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { ALERTS } from '../../constants';
import { errors } from '../../../config/constants.json';

class SettingsAccount extends Block {
  static template = template();
  static routerOptions = {
    name: 'settings-account',
    parent: 'settings',
    path: '/account'
  };

  constructor(opts) {
    super(opts);

    this.reset();
  }

  beforeLoadRoute() {
    setTimeout(() => {
      this.title.text(this.i18n.t('titles.settings_account'));
    }, 0);
  }

  beforeLeaveRoute() {
    this.reset();
  }

  resetChangePasswordBlock() {
    _.assign(this, {
      changePasswordFormChanged: false,
      attemptedToChangePassword: false,
      changingPassword: false,
      currentPassword: '',
      password: '',
      passwordRepeat: ''
    });
  }

  reset() {
    this.resetChangePasswordBlock();
  }

  onChange = () => {
    this.changePasswordFormChanged = true;
  };

  changePassword = (e) => {
    e.preventDefault();

    const {
      currentPassword,
      password,
      changePasswordForm
    } = this;
    const errs = changePasswordForm.validate();

    this.attemptedToChangePassword = true;

    if (!errs) {
      const data = {
        currentPassword,
        password
      };

      this.changingPassword = true;

      this.globals.usersFetch
        .changePassword({ data })
        .then(() => {
          this.resetChangePasswordBlock();
          this.globals.addAlert(ALERTS.CHANGE_PASSWORD_SUCCESS);
        }, (err) => {
          const message = err.response.data;

          if (message === errors.WRONG_PASSWORD) {
            this.globals.addAlert(ALERTS.CHANGE_PASSWORD_FAILURE);
          } else {
            throw err;
          }
        })
        .finally(() => {
          this.changingPassword = false;
        });
    }
  };
}

Block.block('SettingsAccount', SettingsAccount.wrap(
  makeRoute()
));
