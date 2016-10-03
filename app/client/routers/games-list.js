import { D, Router } from 'dwayne';
import HomeState from './home';
import GamesState from './games';
import GamesListStateTemplate from '../views/states/games-list.pug';

class GamesListState extends GamesState {
  static stateName = 'games-list';
  static path = '/';
  static template = GamesListStateTemplate;
}

Router.on('init', () => {
  D(HomeState.templateParams).deepAssign({
    gamesLink: GamesListState.buildURL()
  });
});

export default GamesListState;
