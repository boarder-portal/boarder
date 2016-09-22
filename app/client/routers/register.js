import { D, Elem, Router } from 'dwayne';
import { fetch } from '../fetchers/users';
import RegisterStateTemplate from '../views/states/register.pug';
import { images } from '../constants';

class RegisterState extends Router {
  static stateName = 'register';
  static path = '/register';
  static template = RegisterStateTemplate;
  static templateParams = {
    registerCaption: 'Registration',
    loginCaption: 'Login',
    emailCaption: 'Email',
    passwordCaption: 'Password',
    passwordRepeatCaption: 'Repeat password',
    registerActionCaption: 'Register'
  };

  showIcon(icon, wrong) {
    icon
      .show()
      .toggleClass('fa-check', !wrong)
      .toggleClass('fa-close', wrong);
  }

  onRender() {
    const { base } = this;
    const form = base.find('.register-form');

    const loginInput = form.find('[name="login"]');
    const emailInput = form.find('[name="email"]');
    const passwordInput = form.find('[name="password"]');
    const passwordRepeatInput = form.find('[name="password-repeat"]');
    const spinner = form.find('.register-spinner-container')
      .child(images.loading)
      .addClass('register-spinner')
      .hide();
    const loaded = new Elem([loginInput, emailInput]);

    loginInput.prop('onInput', {
      get: fetch.checkLogin,
      timeout: D(500).timeout()
    });
    emailInput.prop('onInput', {
      get: fetch.checkEmail,
      timeout: D(500).timeout()
    });

    loaded
      .next()
      .forEach((elem) => {
        D(elem)
          .child(images.loading)
          .addClass('register-input-spinner')
          .hide();
      });

    let validated;

    passwordRepeatInput.validate((value) => {
      if (value !== passwordInput.prop('value')) {
        throw new Error('Passwords do not match');
      }
    });

    form
      .find('[type="submit"]')
      .on('click', (e) => {
        e.preventDefault();

        validated = true;

        const errors = form.validate();

        if (errors) {
          return D(errors).forEach(({ message }, name) => {
            form
              .find(`[name="${ name }"`)
              .up()
              .prev()
              .text(message);
          });
        }

        const data = {
          login: loginInput.prop('value'),
          email: emailInput.prop('value'),
          password: passwordInput.prop('value')
        };

        spinner.show();

        fetch.register({ data })
          .then((res) => {
            const {
              errors
            } = res.json;

            if (!errors) {
              return console.log('success!');
            }

            D(errors).forEach(({ field, message }) => {
              form
                .find(`[name="${ field }"`)
                .up()
                .prev()
                .text(D(message).capitalizeFirst());
            });
          })
          .catch((res) => {
            console.log(res);
          })
          .then(() => {
            spinner.hide();
          });
      });

    form.on('input', ({ target }) => {
      target = D(target);

      const name = target.attr('name');
      const errors = target.validate();
      const errorCaption = target
        .up()
        .prev();

      if (validated) {
        errorCaption.text(
          errors
            ? errors[name].message
            : ''
        );
      }

      if (name.indexOf('password') !== -1) {
        this.showIcon(
          target
            .next()
            .find('.fa'),
          errors
        );
      }
    });

    loaded.on('input', ({ target }) => {
      target = D(target);

      const onInput = target.prop('onInput');

      onInput.timeout.abort();

      const timeout = onInput.timeout = D(500).timeout();
      const icon = target
        .next()
        .find('.fa');
      const spinner = target
        .next()
        .find('.register-input-spinner');

      if (target.validate()) {
        timeout.catch(() => {});
        this.showIcon(icon, true);
        spinner.hide();

        return;
      }

      icon.hide();
      spinner.show();

      timeout.then(() => {
        const fetch = onInput.timeout = onInput.get({
          query: {
            [target.attr('name')]: target.prop('value')
          }
        });

        fetch
          .then(({ json: wrong }) => {
            this.showIcon(icon, wrong);
          })
          .catch((err) => {
            if (err.message === 'Request was aborted') {
              throw err;
            }

            console.log(err);
          })
          .then(() => {
            spinner.hide();
          }, () => {});
      }, () => {});
    });
  }
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
