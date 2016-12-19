import { D, Block, makeRoute } from 'dwayne';
import template from './index.pug';
import {
  alertTypes,
  CHANGE_PASSWORD_FAILURE,
  CHANGE_PASSWORD_SUCCESS
} from '../../constants';

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
    D(this).assign({
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
            this.global.addAlert({
              type: alertTypes.CHANGE_PASSWORD_FAILURE,
              level: 'error',
              priority: 'high',
              duration: CHANGE_PASSWORD_FAILURE
            });

            return;
          }

          this.resetChangePasswordBlock();
          this.global.addAlert({
            type: alertTypes.CHANGE_PASSWORD_SUCCESS,
            level: 'success',
            priority: 'high',
            duration: CHANGE_PASSWORD_SUCCESS
          });
        })
        .finally(() => {
          this.changingPassword = false;
        });
    }
  };
}

const wrap = SettingsAccount
  .wrap(makeRoute());

Block.register('SettingsAccount', wrap);
