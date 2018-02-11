import {
  createStore,
  applyMiddleware,
  compose
} from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import rootReducer from '../reducers';

const logger = createLogger({
  collapsed: true
});
const middleware = applyMiddleware(
  thunk,
  logger
);
const store = compose(middleware)(createStore)(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

if (module.hot) {
  module.hot.accept(rootReducer, () => {
    store.replaceReducer(rootReducer);
  });
}

export default store;
