import React, { Component } from 'react';

import { usersFetch } from '../constants';
import { setPageTitle } from '../helpers';
import { errors } from '../../shared/constants';

import { Input, Spinner, Caption } from '../components';

class ForgotPassword extends Component {
  emailInput = null;
  state = {
    fetchSuccess: false,
    submitting: false,
    emailError: false,
    email: null
  };

  componentDidMount() {
    setPageTitle('forgot_password');
  }

  emailInputRef = (input) => {
    this.emailInput = input;
  };

  submit = async (e) => {
    e.preventDefault();

    const email = this.emailInput.value;
    const query = { email };

    this.setState({
      submitting: true,
      emailError: false
    });

    try {
      await usersFetch.forgotPassword({ query });

      this.setState({
        fetchSuccess: true,
        email
      });
    } catch (err) {
      const message = err.response.data;

      if (
        message === errors.WRONG_EMAIL
        || message === errors.NO_SUCH_EMAIL_REGISTERED
      ) {
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
      fetchSuccess,
      submitting,
      emailError,
      email
    } = this.state;

    return (
      <div className="route route-forgot-password">
        <div className="auth-block forgot-password-block">

          <h2 className="auth-header">
            <Caption value="forgot_password.header" />
          </h2>

          {!fetchSuccess && (
            <form
              className="auth-form forgot-password-form"
              onSubmit={this.submit}
            >

              <div className="auth-spinner-container">
                {emailError && (
                  <div className="check-email-caption">
                    <Caption value="forgot_password.try_again" />
                  </div>
                )}
                {submitting && (
                  <Spinner className="auth-spinner" />
                )}
              </div>

              <Input
                inputRef={this.emailInputRef}
                name="email"
                type="text"
                placeholder="forgot_password.fields.email"
              />

              <Input
                className="success"
                type="submit"
                value="forgot_password.action"
                disabled={submitting}
              />

            </form>
          )}

          {fetchSuccess && (
            <div className="auth-success-caption">
              <span>
                <Caption value="forgot_password.success" />
              </span>
              {' '}
              <b className="send-to-email">
                {email}
              </b>
            </div>
          )}

        </div>
      </div>
    );
  }
}

export default ForgotPassword;
