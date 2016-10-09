import { Elem } from 'dwayne';
import AuthState from './auth';
import { usersFetch } from '../fetchers';
import ResetPasswordStateTemplate from '../views/states/reset-password.pug';

class ResetPasswordState extends AuthState {
  static stateName = 'reset-password';
  static path = '/reset-password';
  static template = ResetPasswordStateTemplate;
  static elements = {
    form: {
      $: '.reset-password-form',

      $onValidate: 'onFormValidate',

      inputs: {
        $: 'input[name]',

        $onInput: 'onInputChange',
        $onValidate: 'onInputValidate'
      },
      passwordInput: '[name="password"]',
      passwordRepeatInput: '[name="password-repeat"]',
      submitInput: {
        $: 'input[type="submit"]',

        $onClick: 'onPreSubmit'
      }
    },
    wrongEmailCaption: '.wrong-email-caption',
    successCaption: '.auth-success-caption',
    spinnerContainer: '.auth-spinner-container'
  };

  authStateName = 'reset_password';

  constructor(props) {
    super(props);

    const {
      query,
      templateParams
    } = this;

    templateParams.email = query.email || '';
  }

  submit() {
    const {
      query: {
        email,
        token
      },
      form,
      spinner,
      passwordInput,
      submitInput,
      successCaption,
      wrongEmailCaption
    } = this;

    wrongEmailCaption.hide();
    spinner.show();

    usersFetch.resetPassword({
      data: {
        email,
        password: passwordInput.prop('value'),
        token
      }
    })
      .then(({ json: success }) => {
        if (!success) {
          wrongEmailCaption.show();

          return;
        }

        form.hide();
        successCaption.show();
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
      wrongEmailCaption,
      successCaption
    } = this;

    new Elem([successCaption, wrongEmailCaption])
      .hide()
      .removeClass('hidden');
  }
}

export default ResetPasswordState;
