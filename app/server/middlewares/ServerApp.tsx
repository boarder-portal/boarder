import React, { FC } from 'react';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { RecoilRoot } from 'recoil';

import App from 'client/components/App/App';

import theme from 'client/theme';

interface IServerAppProps {
  url: string;
}

const ServerApp: FC<IServerAppProps> = (props) => {
  const { url } = props;

  return (
    <StaticRouter location={url}>
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <App />
        </RecoilRoot>
      </ThemeProvider>
    </StaticRouter>
  );
};

export default ServerApp;
