import 'regenerator-runtime/runtime';
import { loadableReady } from '@loadable/component';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import sharedStore from 'client/constants/sharedStore';

import { SharedStoreContext } from 'common/utilities/SharedStore';

import App from 'client/components/App/App';

(async () => {
  await loadableReady();

  const root = document.getElementById('root');

  if (!root) {
    console.log('No root element');

    return;
  }

  hydrateRoot(
    root,
    <BrowserRouter>
      <SharedStoreContext.Provider value={sharedStore}>
        <App />
      </SharedStoreContext.Provider>
    </BrowserRouter>,
  );
})();
