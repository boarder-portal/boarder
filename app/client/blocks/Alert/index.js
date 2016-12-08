import { D, Block, Promise } from 'dwayne';
import template from './index.pug';

let currentFetchIfUserConfirmed = Promise.resolve();

class Alert extends Block {
  static template = template();

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

    this.alertElem.on('transitionend', () => {
      this.args.alert.remove();
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
