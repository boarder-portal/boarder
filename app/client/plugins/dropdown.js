import { D, Elem, body } from 'dwayne';

const dropdownSelector = '.fa-sort-down, .fa-sort-up';
let activeDropdown = new Elem();

body.on('click', dropdownSelector, (e) => {
  const { target } = e;
  const dropdownContainer = D(target);

  dropdownContainer.toggleClass('closed');

  if (!dropdownContainer.hasClass('closed')) {
    activeDropdown = dropdownContainer;
  }
});

Elem.addInstanceProperties({
  closeDropdown() {
    this.closest(dropdownSelector)
      .hide();
  }
});

body.on('click', ({ target }) => {
  target = D(target);

  const dropdown = target.closest(dropdownSelector);

  if (!dropdown.length && !target.is(dropdownSelector)) {
    activeDropdown.addClass('closed');
  }
});
