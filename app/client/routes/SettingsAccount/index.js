import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import { ALERTS } from '../../constants';

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
    const errors = changePasswordForm.validate();

    this.attemptedToChangePassword = true;

    if (!errors) {
      const data = {
        currentPassword,
        password
      };

      this.changingPassword = true;

      this.global.usersFetch
        .changePassword({ data })
        .then(({ json: success }) => {
          if (!success) {
            this.global.addAlert(ALERTS.CHANGE_PASSWORD_FAILURE);

            return;
          }

          this.resetChangePasswordBlock();
          this.global.addAlert(ALERTS.CHANGE_PASSWORD_SUCCESS);
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
