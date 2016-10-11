import { Router } from 'dwayne';
import { checkUser } from '../helpers';

const removeListener = Router.on('render', () => {
  removeListener();

  checkUser();
});
