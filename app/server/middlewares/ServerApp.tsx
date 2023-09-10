import React, { FC } from 'react';
import { StaticRouter } from 'react-router-dom';

import { Store, StoreContext } from 'client/utilities/store';

import App from 'client/components/App/App';

interface ServerAppProps {
  url: string;
  store: Store;
}

const ServerApp: FC<ServerAppProps> = (props) => {
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
