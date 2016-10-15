import { D } from 'dwayne';
import { Alert } from './alert';
import { store, REGISTER_NOT_CONFIRMED_ALERT_DURATION } from '../constants';
import { usersFetch } from '../fetchers';
import NotConfirmedAlertTemplate from '../views/alerts/not-confirmed.pug';

let currentFetch = D(0).timeout();

export function checkUser() {
  const { user } = store;

  if (user && !user.confirmed) {
    const alert = new Alert(NotConfirmedAlertTemplate, REGISTER_NOT_CONFIRMED_ALERT_DURATION, 'warning', 'very-low');

    alert.caption.find('.send-one-more')
      .on('click', () => {
        currentFetch.abort();

        currentFetch = usersFetch.sendOneMore()
          .catch(() => {});
      });
  }
}
