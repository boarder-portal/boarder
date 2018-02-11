import { CHANGE_USER_DATA } from '../constants';
import { getUserFromString } from '../helpers';

const initialState = getUserFromString();

export default (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_USER_DATA: {
      if (!action.userData) {
        return initialState;
      }

      return {
        ...state,
        ...action.userData
      };
    }

    default: {
      return state;
    }
  }
};
