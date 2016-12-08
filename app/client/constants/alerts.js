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

export const ALERT_TRANSITION_DURATION = 1 * s;
export const REGISTER_CONFIRMED_ALERT_DURATION = success;
export const REGISTER_NOT_CONFIRMED_ALERT_DURATION = Infinity * s;
export const AJAX_ERROR_ALERT_DURATION = failure;
export const TIME_TO_ALERT_AFTER_LOGIN = 2.5 * s;
export const CHANGE_PASSWORD_SUCCESS = success;
export const CHANGE_PASSWORD_FAILURE = failure;
export const AVATAR_LOADED_SUCCESS = success;
export const AVATAR_CHANGED_SUCCESS = success;
