import { D, parseHTML, Promise, body } from 'dwayne';
import { ALERT_TRANSITION_DURATION } from '../constants';
import AlertTemplate from '../views/partials/alert.pug';

const alerts = {};

let alertId = 0;

class Alert {
  static getById(id) {
    return alerts[id];
  }

  constructor(html, duration, level) {
    const id = alertId++;
    const elem = parseHTML(
      AlertTemplate({
        id,
        caption: html
      })
    );

    elem
      .into('.main-content > .alerts')
      .addClass(level);

    D(this).assign({
      elem,
      duration,
      level
    });

    alerts[id] = this;

    D(100)
      .timeout()
      .then(() => {
        this.show();
      });
  }

  show() {
    const {
      elem,
      duration
    } = this;

    elem.addClass('visible');

    D(ALERT_TRANSITION_DURATION)
      .timeout()
      .then(() => {
        if (duration === Infinity) {
          return new Promise(() => {});
        }

        return D(duration).timeout();
      })
      .then(() => {
        this.remove();
      });
  }

  remove() {
    const { elem } = this;

    elem.removeClass('visible');

    D(ALERT_TRANSITION_DURATION * 2)
      .timeout()
      .then(() => {
        elem.remove();

        delete alerts[this.id];
      });
  }
}

body.on('click', '.main-content > .alerts > .alert > .fa-close', ({ target }) => {
  const alertId = D(target)
    .closest('.alert')
    .id()
    .replace('alert-', '');
  const alert = Alert.getById(alertId);

  alert.remove();
});

export default Alert;
