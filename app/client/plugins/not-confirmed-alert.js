import { D, Router } from 'dwayne';
import Alert from '../helpers/alert';
import { store } from '../constants';

const { user } = store;

if (user && !user.confirmed) {
  const removeListener = Router.on('render', () => {
    removeListener();

    D(1000)
      .timeout()
      .then(() => {
        new Alert('User is not confirmed', Infinity, 'warning');
      });
  });
}
