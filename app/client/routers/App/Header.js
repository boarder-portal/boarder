import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Caption } from '../../components';

import Profile from './Profile';
import Alerts from './Alerts';

class Header extends Component {
  static propTypes = {
    authorized: PropTypes.bool.isRequired
  };

  render() {
    const {
      authorized
    } = this.props;

    return (
      <header className="main-header">

        <h1 className="header-caption">
          <Link to="/">
            <Caption value="header.home_link" />
          </Link>
        </h1>

        <Profile />

        {!authorized && (
          <span className="register-link">
            <Link to="/register">
              <Caption value="header.register_link" />
            </Link>
          </span>
        )}
        {!authorized && (
          <span className="login-link">
            <Link to="/login">
              <Caption value="header.login_link" />
            </Link>
          </span>
        )}

        <Alerts />

      </header>
    );
  }
}

export default connect((state) => ({
  authorized: !!state.user
}))(Header);
