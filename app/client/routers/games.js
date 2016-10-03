import BaseState from './base';
import LoginState from './login';
import GamesStateTemplate from '../views/states/games.pug';
import { store } from '../constants';

class GamesState extends BaseState {
  static abstract = true;
  static stateName = 'games';
  static path = '/games';
  static template = GamesStateTemplate;

  onBeforeLoad(e) {
    if (!store.user) {
      e.go(LoginState.buildURL());
    }
  }
}

export default GamesState;
