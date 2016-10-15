import { D, Elem, body } from 'dwayne';

const dropdownSelector = '.dropdown';
const dropdownActionSelector = '.fa-sort-down, .fa-sort-up';
let activeDropdown = new Elem();

body.on('click', ({ target }) => {
  target = D(target);

  const dropdown = target.closest(dropdownSelector);

  if (!dropdown.length || dropdown.$[0] !== activeDropdown.$[0]) {
    activeDropdown.removeClass('visible');

    activeDropdown = new Elem();
  }
});

body.on('click', dropdownActionSelector, ({ target }) => {
  const dropdown = D(target).closest(dropdownSelector);

  dropdown.toggleClass('visible');

  if (dropdown.hasClass('visible')) {
    activeDropdown = dropdown;
  } else {
    activeDropdown = new Elem();
  }
});

Elem.addInstanceProperties({
  closeDropdown() {
    const dropdown = this.closest(dropdownSelector);

    if (dropdown.length) {
      dropdown.removeClass('visible');

      activeDropdown = new Elem();
    }
  }
});
