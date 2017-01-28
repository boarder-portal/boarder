import { D, Block, body } from 'dwayne';
import template from './index.pug';

const popupSelector = '.popup';
const popupActionSelector = '.open-popup';

class Popup extends Block {
  static template = template();

  visible = false;
  elem = null;

  afterRender() {
    const { elem } = this;

    elem.$[0].boarderPopup = this;
  }

  open() {
    this.visible = true;
  }

  close = () => {
    this.visible = false;
  };
}

body.on('click', popupActionSelector, ({ target }) => {
  const popup = D(target).next(popupSelector);
  const popupInstance = popup.prop('boarderPopup');

  if (popupInstance) {
    popupInstance.open();
  }
});

Block.block('Popup', Popup);
