import _ from 'lodash';

import {
  ADD_ALERT,
  REMOVE_ALERT,
  ALERTS_LEVELS,
  ALERTS_PRIORITIES
} from '../constants';

const initialState = _(ALERTS_PRIORITIES)
  .map((p) => [
    p,
    _(ALERTS_LEVELS)
      .map((l) => [l, []])
      .fromPairs()
      .value()
  ])
  .fromPairs()
  .value();
let id = 0;

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_ALERT: {
      const { alert } = action;

      return {
        ...state,
        [alert.priority]: {
          ...state[alert.priority],
          [alert.level]: [
            ...state[alert.priority][alert.level],
            {
              id: id++,
              type: alert,
              duration: alert.duration
            }
          ]
        }
      };
    }

    case REMOVE_ALERT: {
      const {
        alert,
        alert: {
          type: {
            level,
            priority
          }
        }
      } = action;
      const localAlerts = state[priority][level];
      const index = localAlerts.indexOf(alert);

      return {
        ...state,
        [priority]: {
          ...state[priority],
          [level]: [
            ...localAlerts.slice(0, index),
            ...localAlerts.slice(index + 1)
          ]
        }
      };
    }

    default: {
      return state;
    }
  }
};
