import _ from 'lodash';
import $ from 'jquery';
import React, { Component } from 'react';

import { usersFetch } from '../constants';
import { setPageTitle } from '../helpers';

import { Spinner, Input, InputValidateWrapper, Caption } from '../components';

class Register extends Component {
  loginInput = null;
  emailInput = null;
  passwordInput = null;
  state = {
    registerSuccess: false,
    attemptedToSubmit: false,
    errors: {
      login: null,
      email: null,
      password: null
    },
    submitting: false,
    email: ''
  };

  componentDidMount() {
    setPageTitle('register');
  }

  formRef = (form) => {
    this.$form = $(form);
  };

  loginInputRef = (input) => {
    this.loginInput = input;
  };

  emailInputRef = (input) => {
    this.emailInput = input;
  };

  passwordInputRef = (input) => {
    this.passwordInput = input;
  };

  submit = async (e) => {
    e.preventDefault();

    this.setState({
      attemptedToSubmit: true
    });

    if (this.$form.validate()) {
      return;
    }

    const email = this.emailInput.value;
    const data = {
      login: this.loginInput.value,
      email,
      password: this.passwordInput.value
    };

    this.setState({
      submitting: true
    });

    try {
      const {
        json: {
          errors
        }
      } = await usersFetch.register({ data });

      if (!errors) {
        this.email = email;

        this.setState({
          registerSuccess: true
        });

        return;
      }

      this.setState({
        errors
      });
    } finally {
      this.setState({
        submitting: false
      });
    }
  };

  sendOneMoreConfirmation = _.debounce(() => {
    usersFetch.sendOneMore({
      query: {
        email: this.email
      }
    });
  }, 300);

  render() {
    const {
      registerSuccess,
      attemptedToSubmit,
      errors,
      submitting,
      email
    } = this.state;

    return (
      <div className="route route-register">
        <div className="auth-block register-block">

          <h2 className="auth-header">
            <Caption value="register.header" />
          </h2>

          {!registerSuccess && (
            <form
              ref={this.formRef}
              className="auth-form register-form"
              autoComplete="off"
              onSubmit={this.submit}
            >

              <div className="auth-spinner-container">
                {submitting && (
                  <Spinner className="auth-spinner" />
                )}
              </div>

              <InputValidateWrapper
                validators={['required']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="register"
                error={errors.login}
              >
                <Input
                  inputRef={this.loginInputRef}
                  id="login"
                  name="login"
                  type="text"
                  placeholder="register.fields.login"
                />
              </InputValidateWrapper>

              <InputValidateWrapper
                validators={['required', 'email']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="register"
                error={errors.email}
              >
                <Input
                  inputRef={this.emailInputRef}
                  id="email"
                  name="email"
                  type="text"
                  placeholder="register.fields.email"
                />
              </InputValidateWrapper>

              <InputValidateWrapper
                validators={['required']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="register"
                error={errors.password}
              >
                <Input
                  inputRef={this.passwordInputRef}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="register.fields.password"
                />
              </InputValidateWrapper>

              <InputValidateWrapper
                validators={['required', 'password-repeat']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="register"
              >
                <Input
                  id="password-repeat"
                  name="password-repeat"
                  type="password"
                  placeholder="register.fields.password_repeat"
                />
              </InputValidateWrapper>

              <div className="input-container">
                <Input
                  className="success"
                  type="submit"
                  value="register.action"
                  disabled={submitting}
                />
              </div>

            </form>
          )}

          {registerSuccess && (
            <div className="auth-success-caption">

              <Caption value="register.success" />

              {' '}

              <b className="send-to-email">
                {email}
              </b>

              <p
                className="send-one-more linky"
                onClick={this.sendOneMoreConfirmation}
              >
                <Caption value="register.send_one_more_time" />
              </p>

            </div>
          )}

        </div>
      </div>
    );
  }
}

export default Register;
