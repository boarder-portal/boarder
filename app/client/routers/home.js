import { D, Router } from 'dwayne';
import BaseState from './base';
import HomeStateTemplate from '../views/states/home.pug';

class HomeState extends BaseState {
  static stateName = 'home';
  static path = '/';
  static template = HomeStateTemplate;
}

Router.on('init', () => {
  const homeLink = HomeState.buildURL();

  D(BaseState.prototype).assign({
    homeLink
  });

  D(BaseState.templateParams).deepAssign({
    headerParams: {
      homeLink
    }
  });
});

export default HomeState;
