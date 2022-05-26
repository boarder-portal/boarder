import React, { FC } from 'react';
import { StaticRouter } from 'react-router-dom';

import { IStore, StoreContext } from 'client/utilities/store';

import App from 'client/components/App/App';

interface IServerAppProps {
  url: string;
  store: IStore;
}

const ServerApp: FC<IServerAppProps> = (props) => {
  const { url, store } = props;

  return (
    <StaticRouter location={url}>
      <StoreContext.Provider value={store}>
        <App />
      </StoreContext.Provider>
    </StaticRouter>
  );
};

export default ServerApp;
