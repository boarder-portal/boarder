import { FC } from 'react';
import { StaticRouter } from 'react-router-dom/server';

import SharedStore, { SharedStoreContext } from 'common/utilities/SharedStore';

import App from 'client/components/App/App';

interface ServerAppProps {
  url: string;
  store: SharedStore;
}

const ServerApp: FC<ServerAppProps> = (props) => {
  const { url, store } = props;

  return (
    <StaticRouter location={url}>
      <SharedStoreContext.Provider value={store}>
        <App />
      </SharedStoreContext.Provider>
    </StaticRouter>
  );
};

export default ServerApp;
