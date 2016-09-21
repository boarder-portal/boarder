import { D, Router } from 'dwayne';
import GamesState from './games';
import GamesListStateTemplate from '../views/states/games-list.pug';

class GamesListState extends GamesState {
  static stateName = 'games-list';
  static path = '/';
  static template = GamesListStateTemplate;

  constructor(props) {
    super(props);

    const { templateParams } = this;

    D(templateParams).deepAssign({
      links: {
        hexagon: 'Hexagon'.link(templateParams.urls.hexagon)
      }
    });
  }
}

Router.on('init', () => {
  D(Router.templateParams).deepAssign({
    urls: {
      games: GamesListState.buildURL()
    }
  });
});

export default GamesListState;
