import { D, Elem, Router } from 'dwayne';
import BaseState from './base';
import SettingsState from './settings';
import { usersFetch } from '../fetchers';
import { Alert } from '../helpers';
import SettingsAccountStateTemplate from '../views/states/settings-account.pug';
import ChangePasswordSuccessAlertTemplate from '../views/alerts/change-password-success.pug';
import ChangePasswordFailureAlertTemplate from '../views/alerts/change-password-failure.pug';
import { images, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAILURE } from '../constants';

let failureAlert;

class SettingsAccountState extends SettingsState {
  static stateName = 'settings-account';
  static path = '/account';
  static template = SettingsAccountStateTemplate;
  static elements = {
    form: {
      $: '.change-password-form',

      $onValidate: 'onFormValidate',

      inputs: {
        $: 'input[name]:not([name="current-password"])',

        $onInput: 'onInputChange',
        $onValidate: 'onInputValidate'
      },
      currentPasswordInput: '[name="current-password"]',
      passwordInput: '[name="password"]',
      passwordRepeatInput: '[name="password-repeat"]',
      submitInput: {
        $: 'input[type="submit"]',

        $onClick: 'onPreSubmit'
      }
    },
    spinnerContainer: '.change-password-spinner-container'
  };

  stateName = 'settings.states.account.change_password';

  submit() {
    const {
      form,
      spinner,
      currentPasswordInput,
      passwordInput,
      passwordRepeatInput,
      submitInput
    } = this;

    spinner.show();

    usersFetch.changePassword({
      data: {
        currentPassword: currentPasswordInput.prop('value'),
        password: passwordInput.prop('value')
      }
    })
      .then(({ json: success }) => {
        if (!success) {
          failureAlert = new Alert(ChangePasswordFailureAlertTemplate, CHANGE_PASSWORD_FAILURE, 'error', 'high');

          return;
        }

        if (failureAlert) {
          failureAlert.close();
        }

        new Elem([
          currentPasswordInput,
          passwordInput,
          passwordRepeatInput
        ]).prop('value', '');
        form.find('.fa-check, .fa-times').removeClass('fa-check', 'fa-times');

        this.validated = false;

        new Alert(ChangePasswordSuccessAlertTemplate, CHANGE_PASSWORD_SUCCESS, 'success', 'very-high');
      })
      .catch(() => {})
      .then(() => {
        this.fetching = false;

        submitInput.removeAttr('disabled');
        spinner.hide();
      });
  }

  onRender() {
    const {
      inputs,
      passwordRepeatInput,
      spinnerContainer
    } = this;

    passwordRepeatInput.validate(this.passwordRepeatValidator.bind(this));
    inputs.validate(this.requiredValidator.bind(this));

    D(this).assign({
      spinner: images.loading
        .hide()
        .into(spinnerContainer)
        .addClass('change-password-spinner')
    });
  }
}

Router.on('init', () => {
  const settingsAccountLink = SettingsAccountState.buildURL();

  D(BaseState.templateParams).deepAssign({
    headerParams: {
      settingsLink: settingsAccountLink
    }
  });

  D(SettingsState.templateParams).deepAssign({
    links: {
      settingsAccountLink
    }
  });
});

export default SettingsAccountState;

