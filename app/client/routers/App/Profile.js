import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  userType,
  images, usersFetch
} from '../../constants';

import { Dropdown, Caption } from '../../components';

class Profile extends Component {
  static propTypes = {
    user: userType
  };

  state = {
    logoutFetching: false
  };

  logout = async () => {
    if (this.state.logoutFetching) {
      return;
    }

    this.setState({
      logoutFetching: true
    });

    try {
      await usersFetch.logout();

      location.href = '/';
    } finally {
      this.setState({
        logoutFetching: false
      });
    }
  };

  render() {
    const {
      user
    } = this.props;
    const {
      logoutFetching
    } = this.state;

    if (!user) {
      return null;
    }

    return (
      <div className="profile">

        <div className="avatar-container">
          <img
            className="avatar"
            src={user.avatar}
          />
        </div>

        <span className="login">
          {user.login}
        </span>

        <Dropdown
          hdir="left"
          className="profile-dropdown"
        >

          <Link
            className="dropdown-item settings-link link no-link"
            to="/settings/account"
            action="close"
          >
            <i className="menu-icon fa fa-cog" />
            <Caption value="header.profile.dropdown.settings" />
          </Link>

          <div className="dropdown-divider" />

          <div
            className="dropdown-item logout link"
            onClick={this.logout}
          >
            <i className="menu-icon fa fa-sign-out" />
            <Caption className="logout-caption" value="header.profile.dropdown.logout" />
            {logoutFetching && (
              <img
                className="logout-spinner"
                src={images.loading}
              />
            )}
          </div>

        </Dropdown>
      </div>
    );
  }
}

export default connect((state) => ({
  user: state.user
}))(Profile);
