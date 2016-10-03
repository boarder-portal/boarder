import { D, Router } from 'dwayne';
import BaseState from './base';
import HomeStateTemplate from '../views/states/home.pug';

class HomeState extends BaseState {
  static stateName = 'home';
  static path = '/';
  static template = HomeStateTemplate;
}

Router.on('init', () => {
  D(BaseState.templateParams).deepAssign({
    headerParams: {
      homeLink: HomeState.buildURL()
    }
  });
});

export default HomeState;
