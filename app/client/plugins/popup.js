import { D, Elem, body } from 'dwayne';

const popupSelector = '.popup';
const popupActionSelector = '.open-popup';
const popupOverlaySelector = '.popup-overlay.closing';
const popupCloseSelector = '.popup-close';

body.on('click', popupActionSelector, ({ target }) => {
  const popup = D(target).next(popupSelector);

  popup.addClass('visible');
});

body.on('click', [popupOverlaySelector, popupCloseSelector].join(', '), ({ target }) => {
  D(target).closePopup();
});

Elem.addInstanceProperties({
  closePopup() {
    const popup = this.closest(popupSelector);

    if (popup.length) {
      popup.removeClass('visible');
    }
  }
});
