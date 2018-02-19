import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  usersFetch, historyType,
  TIME_TO_ALERT_AFTER_LOGIN
} from '../constants';
import { addNotConfirmedAlertIfNeeded, changeUserData } from '../actions';
import { getLocationQuery, setPageTitle } from '../helpers';
import { errors } from '../../config/constants.json';

import { Spinner, Input, Caption } from '../components';

class Login extends Component {
  static propTypes = {
    history: historyType.isRequired,
    addNotConfirmedAlertIfNeeded: PropTypes.func.isRequired,
    changeUserData: PropTypes.func.isRequired
  };

  loginInput = null;
  passwordInput = null;
  state = {
    loginSuccess: false,
    loginError: false,
    submitting: false
  };

  componentDidMount() {
    setPageTitle('login');
  }

  loginInputRef = (input) => {
    this.loginInput = input;
  };

  passwordInputRef = (input) => {
    this.passwordInput = input;
  };

  submit = async (e) => {
    e.preventDefault();

    const {
      history,
      addNotConfirmedAlertIfNeeded,
      changeUserData
    } = this.props;
    const data = {
      login: this.loginInput.value,
      password: this.passwordInput.value
    };
    const {
      from = '/'
    } = getLocationQuery();

    this.setState({
      submitting: true,
      loginError: false
    });

    try {
      const {
        json: userData
      } = await usersFetch.login({ data });

      this.setState({
        loginSuccess: true
      });

      changeUserData(userData);
      history.replace(from);

      setTimeout(
        addNotConfirmedAlertIfNeeded,
        TIME_TO_ALERT_AFTER_LOGIN
      );
    } catch (err) {
      this.setState({
        submitting: false
      });

      const message = err.response.data;

      if (message === errors.WRONG_LOGIN_OR_PASSWORD) {
        this.setState({
          loginError: true
        });
      } else {
        throw err;
      }
    }
  };

  render() {
    const {
      loginSuccess,
      loginError,
      submitting
    } = this.state;

    return (
      <div className="route route-login">
        <div className="auth-block login-block">

          <h2 className="auth-header">
            <Caption value="login.header" />
          </h2>

          {!loginSuccess && (
            <form className="auth-form login-form" onSubmit={this.submit}>

              <div className="auth-spinner-container">
                {loginError && (
                  <div className="check-credentials-caption">
                    <Caption value="login.try_again" />
                  </div>
                )}
                {submitting && (
                  <Spinner className="auth-spinner" />
                )}
              </div>

              <Input
                inputRef={this.loginInputRef}
                name="login"
                type="text"
                placeholder="login.fields.login"
                autoComplete="login"
              />

              <Input
                inputRef={this.passwordInputRef}
                name="password"
                type="password"
                placeholder="login.fields.password"
                autoComplete="password"
              />

              <Link
                className="forgot-password"
                to="/forgot_password"
              >
                <Caption value="login.forgot_password" />
              </Link>

              <Link
                className="not-registered"
                to="/register"
              >
                <Caption value="login.not_registered_yet" />
              </Link>

              <Input
                className="success"
                type="submit"
                value="login.action"
                disabled={submitting}
              />

            </form>
          )}

          {loginSuccess && (
            <div className="auth-success-caption">
              <Caption value="login.success" />
            </div>
          )}

        </div>
      </div>
    );
  }
}

export default connect(null, (dispatch) => ({
  addNotConfirmedAlertIfNeeded() {
    dispatch(addNotConfirmedAlertIfNeeded());
  },
  changeUserData(userData) {
    dispatch(changeUserData(userData));
  }
}))(Login);
