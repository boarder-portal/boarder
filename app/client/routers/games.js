import { D, Router } from 'dwayne';
import LoginState from './login';
import GamesStateTemplate from '../views/states/games.pug';
import { store } from '../constants';

class GamesState extends Router {
  static abstract = true;
  static stateName = 'games';
  static path = '/games';
  static template = GamesStateTemplate;

  onBeforeLoad(e) {
    if (!store.user) {
      e.stop();

      D(0)
        .timeout()
        .then(() => LoginState.go());
    }
  }
}

export default GamesState;
