import { Block } from 'dwayne';
import template from './index.pug';
import { usersFetch } from '../../../../fetchers';

class MainHeader extends Block {
  static template = template();

  logoutFetching = false;

  setDropdown = (dropdown) => {
    this.dropdown = dropdown;
  };

  logout() {
    if (this.logoutFetching) {
      return;
    }

    this.logoutFetching = true;

    usersFetch
      .logout()
      .then(() => {
        this.dropdown.close();

        location.href = this.router.buildURL('home');
      })
      .finally(() => {
        this.logoutFetching = false;
      });
  }
}

Block.register('MainHeader', MainHeader);
