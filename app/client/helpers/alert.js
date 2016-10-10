import { D, parseHTML, Promise, body } from 'dwayne';
import { ALERT_TRANSITION_DURATION } from '../constants';
import { Emitter } from './emitter';
import { i18n } from '../i18n';
import AlertTemplate from '../views/partials/alert.pug';

const alerts = {};

let alertId = 0;

class Alert extends Emitter {
  static getById(id) {
    return alerts[id];
  }

  constructor(html, duration, level, locals) {
    super();

    const id = alertId++;
    const elem = parseHTML(
      AlertTemplate({
        id,
        caption: html(
          D({ i18n }).assign(locals).$
        )
      })
    );
    const caption = elem.find('.alert-caption');

    elem
      .into(`.main-content > .alerts > .${ level }`)
      .addClass(level);

    D(this).assign({
      elem,
      caption,
      duration,
      level
    });

    alerts[id] = this;

    D(100)
      .timeout()
      .then(() => {
        this.show();

        return D(ALERT_TRANSITION_DURATION).timeout();
      })
      .then(() => {
        this.emit('show');
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
      .then(() => this.close());
  }

  close() {
    const { elem } = this;

    elem.removeClass('visible');

    D(ALERT_TRANSITION_DURATION)
      .timeout()
      .then(() => {
        this.emit('close');

        return D(ALERT_TRANSITION_DURATION).timeout();
      })
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

  alert.close();
});

export { Alert };
