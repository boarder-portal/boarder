const s = 1000;
const success = 2.5 * s;
const failure = 4 * s;

export const alertsPriorities = [
  'very-low',
  'low',
  'medium',
  'high',
  'very-high'
];
export const alertsLevels = [
  'success',
  'info',
  'warning',
  'error'
];
export const alertTypes = {
  AJAX_ERROR: 'AJAX_ERROR',
  CHANGE_PASSWORD_FAILURE: 'CHANGE_PASSWORD_FAILURE',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  USER_CONFIRMED: 'USER_CONFIRMED',
  USER_NOT_CONFIRMED: 'USER_NOT_CONFIRMED',
  AVATAR_ADDED: 'AVATAR_ADDED',
  AVATAR_CHANGED: 'AVATAR_CHANGED'
};

export const ALERT_TRANSITION_DURATION = 1 * s;
export const REGISTER_CONFIRMED_ALERT_DURATION = success;
export const REGISTER_NOT_CONFIRMED_ALERT_DURATION = Infinity * s;
export const AJAX_ERROR_ALERT_DURATION = failure;
export const TIME_TO_ALERT_AFTER_LOGIN = 2.5 * s;
export const TIME_TO_ALERT_AFTER_PAGE_LOAD = 7.5 * s;
export const CHANGE_PASSWORD_SUCCESS = success;
export const CHANGE_PASSWORD_FAILURE = failure;
export const AVATAR_LOADED_SUCCESS = success;
export const AVATAR_CHANGED_SUCCESS = success;
