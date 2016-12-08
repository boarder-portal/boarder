import { D, Block } from 'dwayne';
import { ALERT_TRANSITION_DURATION } from '../../constants';
import template from './index.pug';

class Alert extends Block {
  static template = template();

  visible = false;

  afterRender() {
    const { alert } = this.args;

    this.visible = true;

    if (alert.duration !== Infinity) {
      D(ALERT_TRANSITION_DURATION + alert.duration)
        .timeout()
        .then(() => {
          this.close();
        });
    }
  }

  close = () => {
    this.args.alert.remove();
  };
}

Block.register('Alert', Alert);
