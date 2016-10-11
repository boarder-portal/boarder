import { D, Router } from 'dwayne';
import { Alert } from '../helpers';
import { store, REGISTER_NOT_CONFIRMED_ALERT_DURATION } from '../constants';
import { usersFetch } from '../fetchers';
import NotConfirmedAlertTemplate from '../views/alerts/not-confirmed.pug';

const { user } = store;
let currentFetch = D(0).timeout();

currentFetch.catch(() => {});

if (user && !user.confirmed) {
  const removeListener = Router.on('render', () => {
    removeListener();

    const alert = new Alert(NotConfirmedAlertTemplate, REGISTER_NOT_CONFIRMED_ALERT_DURATION, 'warning');

    alert.caption.find('.send-one-more')
      .on('click', () => {
        currentFetch.abort();

        currentFetch = usersFetch.sendOneMore()
          .catch(() => {});
      });
  });
}
