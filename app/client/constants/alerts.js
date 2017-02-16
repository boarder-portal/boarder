const s = 1000;
const success = 2.5 * s;
const failure = 4 * s;

export const ALERTS_PRIORITIES = {
  VERY_LOW: 'very-low',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very-high'
};
export const ALERTS_LEVELS = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};
export const ALERTS = {
  AJAX_ERROR: {
    level: ALERTS_LEVELS.ERROR,
    priority: ALERTS_PRIORITIES.HIGH,
    duration: failure
  },
  CHANGE_PASSWORD_FAILURE: {
    level: ALERTS_LEVELS.ERROR,
    priority: ALERTS_PRIORITIES.HIGH,
    duration: failure
  },
  CHANGE_PASSWORD_SUCCESS: {
    level: ALERTS_LEVELS.SUCCESS,
    priority: ALERTS_PRIORITIES.HIGH,
    duration: success
  },
  USER_CONFIRMED: {
    level: ALERTS_LEVELS.SUCCESS,
    priority: ALERTS_PRIORITIES.LOW,
    duration: success
  },
  USER_NOT_CONFIRMED: {
    level: ALERTS_LEVELS.WARNING,
    priority: ALERTS_PRIORITIES.VERY_LOW,
    duration: Infinity * s
  },
  AVATAR_ADDED: {
    level: ALERTS_LEVELS.SUCCESS,
    priority: ALERTS_PRIORITIES.MEDIUM,
    duration: success
  },
  AVATAR_CHANGED: {
    level: ALERTS_LEVELS.SUCCESS,
    priority: ALERTS_PRIORITIES.MEDIUM,
    duration: success
  }
};

export const ALERT_TRANSITION_DURATION = 1 * s;
export const TIME_TO_ALERT_AFTER_LOGIN = 2.5 * s;
export const TIME_TO_ALERT_AFTER_PAGE_LOAD = 7.5 * s;
