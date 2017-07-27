import _ from 'lodash';
import { Block, makeRoute } from 'dwayne';
import template from './index.pug';
import {
  getUserFromString,
  constructFetchers,
  fetcher
} from '../../helpers';
import {
  ALERTS,
  ALERTS_LEVELS,
  ALERTS_PRIORITIES,
  TIME_TO_ALERT_AFTER_PAGE_LOAD
} from '../../constants';

import './blocks/Header';
import './blocks/Content';
import './blocks/Footer';

let alertId = 0;

class App extends Block {
  static template = template();
  static routerOptions = {
    name: 'root',
    abstract: true,
    root: true
  };

  constructor(opts) {
    super(opts);

    const user = getUserFromString();
    const alerts = _(ALERTS_PRIORITIES)
      .map((p) => [
        p,
        _(ALERTS_LEVELS)
          .map((l) => [l, []])
          .fromPairs()
          .value()
      ])
      .fromPairs()
      .value();

    fetcher
      .after((err, res) => {
        if (res.headers['Custom-Error'] !== 'true') {
          console.log(res);

          this.addAlert(ALERTS.AJAX_ERROR);
        }

        throw err;
      });

    _.assign(this.globals, {
      user,
      changeUser: this.changeUser,
      alerts,
      addAlert: this.addAlert,
      usersFetch: constructFetchers('users'),
      userFetch: constructFetchers('user'),
      langFetch: constructFetchers('lang'),
      avatarsFetch: constructFetchers('avatar'),
      addNotConfirmedAlertIfNeeded: this.addNotConfirmedAlertIfNeeded
    });

    if (user && !user.confirmed) {
      setTimeout(this.addNotConfirmedAlertIfNeeded, TIME_TO_ALERT_AFTER_PAGE_LOAD);
    }
  }

  changeUser = (user) => {
    this.globals.user = {
      ...this.globals.user,
      ...user
    };
  };

  addAlert = (Alert) => {
    const {
      level,
      priority,
      duration
    } = Alert;
    const alerts = this.globals.alerts;

    const alert = {
      id: alertId++,
      type: Alert,
      duration,
      remove: () => {
        const alerts = this.globals.alerts;
        const alertsArray = alerts[priority][level];
        const index = alertsArray.indexOf(alert);

        if (index === -1) {
          return;
        }

        this.globals.alerts = {
          ...alerts,
          [priority]: {
            ...alerts[priority],
            [level]: [
              ...alertsArray.slice(0, index),
              ...alertsArray.slice(index + 1)
            ]
          }
        };
      }
    };

    this.globals.alerts = {
      ...alerts,
      [priority]: {
        ...alerts[priority],
        [level]: [
          ...alerts[priority][level],
          alert
        ]
      }
    };
  };

  addNotConfirmedAlertIfNeeded = () => {
    const { user } = this.globals;

    if (user && !user.confirmed) {
      this.addAlert(ALERTS.USER_NOT_CONFIRMED);
    }
  };
}

Block.block('App', App.wrap(
  makeRoute()
));
