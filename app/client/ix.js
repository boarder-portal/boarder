import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import App from './routers/App';
import store from './store';

import './plugins';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('.app-root')
);
