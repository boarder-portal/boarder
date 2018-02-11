import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ALERTS, usersFetch } from '../../constants';
import { addAlert } from '../../actions';
import { setPageTitle } from '../../helpers';
import { Caption, Spinner, Input, InputValidateWrapper } from '../../components';

import { errors } from '../../../config/constants';

class Account extends Component {
  static propTypes = {
    changePasswordFailure: PropTypes.func,
    changePasswordSuccess: PropTypes.func
  };

  state = {
    changePasswordFormChanged: false,
    attemptedToChangePassword: false,
    changingPassword: false,
    currentPassword: '',
    newPassword: '',
    passwordRepeat: ''
  };

  componentDidMount() {
    setPageTitle('settings_account');
  }

  formRef = (form) => {
    this.$form = $(form);
  };

  onFormChange = () => {
    this.setState({
      changePasswordFormChanged: true
    });
  };

  setCurrentPassword = (e) => {
    this.setState({
      currentPassword: e.target.value
    });
  };

  setNewPassword = (e) => {
    this.setState({
      newPassword: e.target.value
    });
  };

  setPasswordRepeat = (e) => {
    this.setState({
      passwordRepeat: e.target.value
    });
  };

  submit = async (e) => {
    e.preventDefault();

    const {
      changePasswordFailure,
      changePasswordSuccess
    } = this.props;
    const {
      currentPassword,
      newPassword
    } = this.state;

    this.setState({
      attemptedToChangePassword: true
    });

    if (this.$form.validate()) {
      return;
    }

    const data = {
      currentPassword,
      newPassword
    };

    this.setState({
      changingPassword: true
    });

    try {
      await usersFetch.changePassword({ data });

      this.setState({
        changePasswordFormChanged: false,
        attemptedToChangePassword: false,
        changingPassword: false,
        currentPassword: '',
        newPassword: '',
        passwordRepeat: ''
      });
      changePasswordSuccess();
    } catch (err) {
      const message = err.response.data;

      if (message === errors.WRONG_PASSWORD) {
        changePasswordFailure();
      } else {
        throw err;
      }
    } finally {
      this.setState({
        changingPassword: false
      });
    }
  };

  render() {
    const {
      changePasswordFormChanged,
      attemptedToChangePassword,
      changingPassword,
      currentPassword,
      newPassword,
      passwordRepeat
    } = this.state;

    return (
      <div className="route route-settings-account">
        <div className="settings-instance-section change-password-section">

          <h2 className="settings-instance-section-header">

            <Caption
              value="settings.states.account.change_password.header"
              className="change-password-header"
            />

            {changingPassword && (
              <div className="change-password-spinner-container">
                <Spinner className="change-password-spinner" />
              </div>
            )}

          </h2>

          <form
            ref={this.formRef}
            className="change-password-form"
            autoComplete="off"
            onSubmit={this.submit}
            onInput={this.onFormChange}
            onChange={this.onFormChange}
          >

            <InputValidateWrapper
              validators={['required']}
              showErrorMessage={attemptedToChangePassword}
              i18nModule="settings.states.account.change_password"
              empty={!changePasswordFormChanged}
            >
              <Input
                id="current-password"
                name="current-password"
                type="password"
                placeholder="settings.states.account.change_password.fields.current_password"
                value={currentPassword}
                onChange={this.setCurrentPassword}
              />
            </InputValidateWrapper>

            <InputValidateWrapper
              validators={['required']}
              showErrorMessage={attemptedToChangePassword}
              i18nModule="settings.states.account.change_password"
              empty={!changePasswordFormChanged}
            >
              <Input
                id="new-password"
                name="password"
                type="password"
                placeholder="settings.states.account.change_password.fields.new_password"
                value={newPassword}
                onChange={this.setNewPassword}
              />
            </InputValidateWrapper>

            <InputValidateWrapper
              validators={['required', 'password-repeat']}
              showErrorMessage={attemptedToChangePassword}
              i18nModule="settings.states.account.change_password"
              empty={!changePasswordFormChanged}
            >
              <Input
                id="password-repeat"
                name="password-repeat"
                type="password"
                placeholder="settings.states.account.change_password.fields.password_repeat"
                value={passwordRepeat}
                onChange={this.setPasswordRepeat}
              />
            </InputValidateWrapper>

            <div className="input-container">
              <Input
                className="success"
                type="submit"
                value="settings.states.account.change_password.action"
                disabled={changingPassword}
              />
            </div>

          </form>

        </div>
      </div>
    );
  }
}

export default connect(null, (dispatch) => ({
  changePasswordFailure() {
    dispatch(addAlert(ALERTS.CHANGE_PASSWORD_FAILURE));
  },
  changePasswordSuccess() {
    dispatch(addAlert(ALERTS.CHANGE_PASSWORD_SUCCESS));
  }
}))(Account);
