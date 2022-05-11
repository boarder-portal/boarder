import 'regenerator-runtime/runtime';
import './styles/reset.pcss';
import 'boarder-components/dist/index.css';

import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { RecoilRoot } from 'recoil';

import App from 'client/components/App/App';

import theme from 'client/theme';

render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </ThemeProvider>
  </BrowserRouter>,
  document.querySelector('#root'),
);
