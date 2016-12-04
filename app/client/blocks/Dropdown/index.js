import { D, Block, body } from 'dwayne';
import template from './index.pug';

const dropdownSelector = '.dropdown';
let activeDropdown;

class Dropdown extends Block {
  static template = template();

  visible = false;
  elem = null;

  afterRender() {
    const { elem } = this;

    elem.$[0].boarderDropdown = this;

    elem
      .find('[action="close"]')
      .on('click', this.close);
  }

  open() {
    this.visible = true;

    if (activeDropdown && activeDropdown !== this) {
      activeDropdown.close();
    }

    activeDropdown = this;
  }

  close = () => {
    this.visible = false;
    activeDropdown = null;
  };
}

body.on('click', ({ target }) => {
  target = D(target);

  if (!activeDropdown) {
    return;
  }

  const dropdown = target.closest(dropdownSelector);

  if (!dropdown.length) {
    return activeDropdown.close();
  }

  const dropdownInstance = dropdown.$[0].boarderDropdown;

  if (dropdownInstance === activeDropdown) {
    return;
  }

  activeDropdown.close();
});

Block.register('Dropdown', Dropdown);
