import { combineReducers } from 'redux';

import alertsReducer from './alerts';
import userReducer from './user';

export default combineReducers({
  alerts: alertsReducer,
  user: userReducer
});
