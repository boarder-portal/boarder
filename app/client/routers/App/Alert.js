import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ClassName from 'classnames';

import {
  ALERTS, ALERT_TRANSITION_DURATION,
  usersFetch, alertType
} from '../../constants';
import { removeAlert } from '../../actions';

import { Caption } from '../../components';

class Alert extends Component {
  static propTypes = {
    alert: alertType,
    removeAlert: PropTypes.func.isRequired
  };

  state = {
    visible: false
  };

  componentDidMount() {
    const {
      alert: { duration }
    } = this.props;

    setTimeout(() => {
      this.setState({
        visible: true
      });

      if (!_.isNull(duration)) {
        this.closeTimeout = setTimeout(this.close, duration + ALERT_TRANSITION_DURATION);
      }
    }, 100);
  }

  close = () => {
    const {
      removeAlert
    } = this.props;

    this.setState({
      visible: false
    });

    clearTimeout(this.closeTimeout);
    setTimeout(removeAlert, ALERT_TRANSITION_DURATION);
  };

  sendOneMoreConfirmation = _.debounce(() => {
    usersFetch.sendOneMore();
  }, 300);

  render() {
    const {
      alert: {
        type
      }
    } = this.props;

    return (
      <div className={ClassName('alert', {
        visible: this.state.visible
      })}>
        <div className="alert-caption">
          {do {
            /* eslint-disable no-unused-expressions */
            if (type === ALERTS.AJAX_ERROR) {
              <Caption value="alerts.ajax_error.base" />;
            } else if (type === ALERTS.CHANGE_PASSWORD_FAILURE) {
              <Caption value="alerts.change_password.failure" />;
            } else if (type === ALERTS.CHANGE_PASSWORD_SUCCESS) {
              <Caption value="alerts.change_password.success" />;
            } else if (type === ALERTS.USER_CONFIRMED) {
              <Caption value="alerts.confirmed.base" />;
            } else if (type === ALERTS.USER_NOT_CONFIRMED) {
              [
                <span key="1">
                  <Caption value="alerts.not_confirmed.base" />
                  {'. '}
                </span>,
                <span
                  key="2"
                  className="linky send-one-more"
                  onClick={this.sendOneMoreConfirmation}
                >
                  <Caption value="alerts.not_confirmed.send_one_more_time" />
                </span>
              ];
            } else if (type === ALERTS.AVATAR_ADDED) {
              <Caption value="alerts.avatar_added.base" />;
            } else if (type === ALERTS.AVATAR_CHANGED) {
              <Caption value="alerts.avatar_changed.base" />;
            } else {
              null;
            }
            /* eslint-enable no-unused-expressions */
          }}
        </div>
        <i className="fa fa-close" onClick={this.close} />
      </div>
    );
  }
}

export default connect(null, (dispatch, { alert }) => ({
  removeAlert() {
    dispatch(removeAlert(alert));
  }
}))(Alert);
