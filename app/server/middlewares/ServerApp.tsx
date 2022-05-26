import React, { FC } from 'react';
import { StaticRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import App from 'client/components/App/App';

interface IServerAppProps {
  url: string;
}

const ServerApp: FC<IServerAppProps> = (props) => {
  const { url } = props;

  return (
    <StaticRouter location={url}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </StaticRouter>
  );
};

export default ServerApp;
