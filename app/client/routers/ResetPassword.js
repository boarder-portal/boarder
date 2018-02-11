import $ from 'jquery';
import React, { Component } from 'react';

import { usersFetch } from '../constants';
import { getLocationQuery, setPageTitle } from '../helpers';
import { errors } from '../../config/constants.json';

import { Input, InputValidateWrapper, Spinner, Caption } from '../components';

class ResetPassword extends Component {
  passwordInput = null;
  email = null;
  token = null;
  query = getLocationQuery();
  state = {
    attemptedToSubmit: false,
    resetPasswordSuccess: false,
    submitting: false,
    emailError: false
  };

  componentDidMount() {
    setPageTitle('forgot_password');
  }

  formRef = (form) => {
    this.$form = $(form);
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

    const data = {
      email: this.query.email,
      token: this.query.token,
      password: this.passwordInput.value
    };

    this.setState({
      submitting: true,
      emailError: false
    });

    try {
      await usersFetch.resetPassword({ data });

      this.setState({
        resetPasswordSuccess: true
      });
    } catch (err) {
      const message = err.response.data;

      if (message === errors.WRONG_EMAIL_OR_TOKEN) {
        this.setState({
          emailError: true
        });
      } else {
        throw err;
      }
    } finally {
      this.setState({
        submitting: false
      });
    }
  };

  render() {
    const {
      attemptedToSubmit,
      resetPasswordSuccess,
      submitting,
      emailError
    } = this.state;

    return (
      <div className="route route-reset-password">
        <div className="auth-block reset-password-block">

          <h2 className="auth-header">
            <Caption value="reset_password.header"/>
          </h2>

          {!resetPasswordSuccess && (
            <form
              ref={this.formRef}
              className="auth-form reset-password-form"
              autoComplete="off"
              onSubmit={this.submit}
            >

              <div className="auth-spinner-container">
                {emailError && (
                  <div className="wrong-email-caption">
                    <Caption value="reset_password.wrong_email"/>
                  </div>
                )}
                {submitting && (
                  <Spinner className="auth-spinner" />
                )}
              </div>

              <div className="input-container">
                <Input
                  id="email"
                  type="text"
                  value={this.query.email}
                  disabled
                />
              </div>

              <InputValidateWrapper
                validators={['required']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="reset_password"
              >
                <Input
                  inputRef={this.passwordInputRef}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="reset_password.fields.password"
                />
              </InputValidateWrapper>

              <InputValidateWrapper
                validators={['required', 'password-repeat']}
                showErrorMessage={attemptedToSubmit}
                i18nModule="reset_password"
              >
                <Input
                  id="password-repeat"
                  name="password-repeat"
                  type="password"
                  placeholder="reset_password.fields.password_repeat"
                />
              </InputValidateWrapper>

              <div className="input-container">
                <Input
                  className="success"
                  type="submit"
                  value="reset_password.action"
                  disabled={submitting}
                />
              </div>

            </form>
          )}

          {resetPasswordSuccess && (
            <div className="auth-success-caption">
              <Caption value="reset_password.success"/>
            </div>
          )}

        </div>
      </div>
    );
  }
}

export default ResetPassword;
