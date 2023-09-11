import 'regenerator-runtime/runtime';
import { loadableReady } from '@loadable/component';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import createStore, { StoreContext } from 'client/utilities/store';

import App from 'client/components/App/App';

(async () => {
  await loadableReady();

  const store = createStore(window.initialState);

  hydrate(
    <BrowserRouter>
      <StoreContext.Provider value={store}>
        <App />
      </StoreContext.Provider>
    </BrowserRouter>,
    document.querySelector('#root'),
  );
})();
