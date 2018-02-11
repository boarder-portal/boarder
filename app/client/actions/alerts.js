import {
  ALERTS,
  ADD_ALERT,
  REMOVE_ALERT
} from '../constants';

export function addAlert(type) {
  return {
    type: ADD_ALERT,
    alert: type
  };
}

export function removeAlert(alert) {
  return {
    type: REMOVE_ALERT,
    alert
  };
}

export function addNotConfirmedAlertIfNeeded() {
  return (dispatch, getState) => {
    const {
      user
    } = getState();

    if (user && !user.confirmed) {
      dispatch(addAlert(ALERTS.USER_NOT_CONFIRMED));
    }
  };
}
