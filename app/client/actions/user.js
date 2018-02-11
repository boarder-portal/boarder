import {
  CHANGE_USER_DATA
} from '../constants';

export function changeUserData(userData) {
  return {
    type: CHANGE_USER_DATA,
    userData
  };
}
