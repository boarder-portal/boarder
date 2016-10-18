const ms = 1000;
const success = 2.5 * ms;
const failure = 4 * ms;

export const ALERT_TRANSITION_DURATION = 1 * ms;
export const REGISTER_CONFIRMED_ALERT_DURATION = success;
export const REGISTER_NOT_CONFIRMED_ALERT_DURATION = Infinity * ms;
export const AJAX_ERROR_ALERT_DURATION = failure;
export const TIME_TO_ALERT_AFTER_LOGIN = 2.5 * ms;
export const CHANGE_PASSWORD_SUCCESS = success;
export const CHANGE_PASSWORD_FAILURE = failure;
export const AVATAR_LOADED_SUCCESS = success;
export const AVATAR_CHANGED_SUCCESS = success;
