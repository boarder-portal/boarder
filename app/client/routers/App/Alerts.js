import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ALERTS_PRIORITIES, ALERTS_LEVELS, alertType } from '../../constants';

import Alert from './Alert';

class Alerts extends Component {
  static propTypes = {
    alerts: PropTypes.shape(
      _(ALERTS_PRIORITIES)
        .map((p) => [
          p,
          PropTypes.shape(
            _(ALERTS_LEVELS)
              .map((l) => [
                l,
                PropTypes.arrayOf(alertType)
              ])
              .fromPairs()
              .value()
          )
        ])
        .fromPairs()
        .value()
    )
  };

  render() {
    const {
      alerts
    } = this.props;

    return (
      <div className="alerts">
        {_.map(alerts, (priorityAlerts, priority) => (
          <div
            key={priority}
            className={priority}
          >
            {_.map(priorityAlerts, (levelAlerts, level) => (
              <div
                key={level}
                className={`${level}-alerts`}
              >
                {levelAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    alert={alert}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default connect((state) => ({
  alerts: state.alerts
}))(Alerts);
