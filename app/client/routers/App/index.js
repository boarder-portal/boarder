import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import {
  TIME_TO_ALERT_AFTER_PAGE_LOAD,
  userType
} from '../../constants';
import { addNotConfirmedAlertIfNeeded } from '../../actions';
import { gamesList } from '../../../shared/games';

import Header from './Header';
import Footer from './Footer';

import Home from '../Home';
import NotFound from '../NotFound';

import Login from '../Login';
import Register from '../Register';
import ForgotPassword from '../ForgotPassword';
import ResetPassword from '../ResetPassword';

import Settings from '../Settings';

import GamesList from '../GamesList';
import Lobby from '../Lobby';
import Room from '../Room';

const history = createHistory();

class App extends Component {
  static propTypes = {
    user: userType,
    addNotConfirmedAlertIfNeeded: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {
      user,
      addNotConfirmedAlertIfNeeded
    } = this.props;

    if (user && !user.confirmed) {
      setTimeout(
        addNotConfirmedAlertIfNeeded,
        TIME_TO_ALERT_AFTER_PAGE_LOAD
      );
    }
  }

  render() {
    return (
      <Router history={history}>
        <div className="route route-root">

          <Header />

          <main className="main-content">
            <Switch>
              <Route exact strict path="/" component={Home} />

              <Route exact strict path="/login" component={Login} />
              <Route exact strict path="/register" component={Register} />
              <Route exact strict path="/forgot_password" component={ForgotPassword} />
              <Route exact strict path="/reset_password" component={ResetPassword} />

              <Route strict path="/settings" component={Settings} />

              <Route exact strict path="/games" component={GamesList} />
              <Route exact strict path={`/games/:game(${gamesList.join('|')})`} component={Lobby} />
              <Route exact strict path={`/games/:game(${gamesList.join('|')})/:roomId`} component={Room} />

              <Route component={NotFound} />
            </Switch>
          </main>

          <Footer />

        </div>
      </Router>
    );
  }
}

export default connect((state) => ({
  user: state.user
}), (dispatch) => ({
  addNotConfirmedAlertIfNeeded() {
    dispatch(addNotConfirmedAlertIfNeeded());
  }
}))(App);
