import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ALERTS, locationType, historyType } from '../constants';
import { addAlert } from '../actions';
import { getLocationQuery, setPageTitle } from '../helpers';

import { Caption } from '../components';

class Home extends Component {
  static propTypes = {
    addUserConfirmedAlert: PropTypes.func.isRequired,
    location: locationType.isRequired,
    history: historyType.isRequired
  };

  componentDidMount() {
    const {
      history,
      addUserConfirmedAlert
    } = this.props;
    const query = getLocationQuery();

    setPageTitle('home');

    if ('register_confirmed' in query) {
      addUserConfirmedAlert();
      history.replace('/');
    }
  }

  render() {
    return (
      <div className="route route-home">
        <div>
          <Link to="/games">
            <Caption value="home.games_caption" />
          </Link>
        </div>
      </div>
    );
  }
}

export default connect(null, (dispatch) => ({
  addUserConfirmedAlert() {
    dispatch(addAlert(ALERTS.USER_CONFIRMED));
  }
}))(Home);
