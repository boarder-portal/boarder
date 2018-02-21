import React, { Component } from 'react';
import { Route, NavLink, Switch, Redirect } from 'react-router-dom';

import { whenLoggedIn } from '../../helpers';
import { Caption } from '../../components';

import Account from './Account';
import Profile from './Profile';

const COMMON_NAV_LINK_PROPS = {
  className: 'no-link',
  activeClassName: 'menu-active'
};

class Settings extends Component {
  render() {
    return (
      <div className="route route-settings">
        <div className="settings-menu">

          <NavLink to="/settings/account" {...COMMON_NAV_LINK_PROPS}>
            <Caption value="settings.menu.account" />
          </NavLink>

          <NavLink to="/settings/profile" {...COMMON_NAV_LINK_PROPS}>
            <Caption value="settings.menu.profile" />
          </NavLink>

        </div>
        <div className="settings-content">
          <Switch>
            <Route exact strict path="/settings/account" component={Account} />
            <Route exact strict path="/settings/profile" component={Profile} />
            <Redirect
              to="/settings/account"
              push={false}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

export default whenLoggedIn(Settings);
