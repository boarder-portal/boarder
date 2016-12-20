import { D, Block, makeRoute } from 'dwayne';
import template from './index.pug';
import {
  getUserFromString,
  constructFetchers,
  fetcher
} from '../../helpers';
import {
  alertsLevels,
  alertsPriorities,
  alertTypes,
  AJAX_ERROR_ALERT_DURATION,
  REGISTER_NOT_CONFIRMED_ALERT_DURATION,
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
    const alerts = D(alertsPriorities).object((alerts, priority) => {
      alerts[priority] = D(alertsLevels).object((alerts, level) => {
        alerts[level] = [];
      }).$;
    }).$;

    fetcher
      .after((err, res) => {
        console.log(res);

        this.addAlert({
          type: alertTypes.AJAX_ERROR,
          priority: 'high',
          level: 'error',
          duration: AJAX_ERROR_ALERT_DURATION
        });

        throw err;
      });

    D(this.global).assign({
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
    this.global.user = {
      ...this.global.user,
      ...user
    };
  };

  addAlert = ({ type, level, priority, duration }) => {
    const alerts = this.global.alerts;

    const alert = {
      id: alertId++,
      type,
      duration,
      remove: () => {
        const alerts = this.global.alerts;
        const alertsArray = alerts[priority][level];
        const index = alertsArray.indexOf(alert);

        if (index === -1) {
          return;
        }

        this.global.alerts = {
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

    this.global.alerts = {
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
    const { user } = this.global;

    if (user && !user.confirmed) {
      this.addAlert({
        type: alertTypes.USER_NOT_CONFIRMED,
        level: 'warning',
        priority: 'very-low',
        duration: REGISTER_NOT_CONFIRMED_ALERT_DURATION
      });
    }
  };
}

const wrap = App
  .wrap(makeRoute());

Block.register('App', wrap);
