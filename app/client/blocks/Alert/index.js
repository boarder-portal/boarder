import { D, Block, Promise } from 'dwayne';
import template from './index.pug';
import { alertTypes } from '../../constants';

let currentFetchIfUserConfirmed = Promise.resolve();

class Alert extends Block {
  static template = template();

  alertTypes = alertTypes;
  visible = false;

  afterRender() {
    const { alert } = this.args;

    D(100)
      .timeout()
      .then(() => {
        this.visible = true;

        if (alert.duration !== Infinity) {
          const off = this.alertElem.on('transitionend', () => {
            off();

            D(alert.duration)
              .timeout()
              .then(this.close);
          });
        }
      });
  }

  close = () => {
    this.visible = false;

    this.alertElem.on('transitionend', ({ target }) => {
      if (D(target).hasClass('alert')) {
        this.args.alert.remove();
      }
    });
  };

  sendOneMoreConfirmation = () => {
    currentFetchIfUserConfirmed.abort();

    currentFetchIfUserConfirmed = this.global.usersFetch
      .sendOneMore();
    currentFetchIfUserConfirmed.catch(() => {});
  };
}

Block.register('Alert', Alert);
