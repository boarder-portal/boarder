import 'regenerator-runtime/runtime';
import { loadableReady } from '@loadable/component';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import createStore, { StoreContext } from 'client/utilities/store';

import App from 'client/components/App/App';

(async () => {
  await loadableReady();

  const store = createStore(window.initialState);
  const root = document.getElementById('root');

  if (!root) {
    console.log('No root element');

    return;
  }

  hydrateRoot(
    root,
    <BrowserRouter>
      <StoreContext.Provider value={store}>
        <App />
      </StoreContext.Provider>
    </BrowserRouter>,
  );
})();
