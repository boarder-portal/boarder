import { D, Block } from 'dwayne';
import Promise from 'el-promise';
import template from './index.pug';
import { ALERTS } from '../../constants';

let currentFetchIfUserConfirmed = Promise.resolve();

class Alert extends Block {
  static template = template();

  ALERTS = ALERTS;
  visible = false;

  afterRender() {
    const { alert } = this.args;

    setTimeout(() => {
      this.visible = true;

      if (alert.duration !== Infinity) {
        const off = this.alertElem.on('transitionend', () => {
          off();

          setTimeout(this.close, alert.duration);
        });
      }
    }, 100);
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

    currentFetchIfUserConfirmed = this.globals.usersFetch
      .sendOneMore();
    currentFetchIfUserConfirmed.catch(() => {});
  };
}

Block.block('Alert', Alert);
