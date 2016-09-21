import { D, Router } from 'dwayne';
import HomeStateTemplate from '../views/states/home.pug';

class HomeState extends Router {
  static stateName = 'home';
  static path = '/';
  static template = HomeStateTemplate;

  constructor(props) {
    super(props);

    const { templateParams } = this;

    D(templateParams).deepAssign({
      links: {
        games: 'Games'.link(templateParams.urls.games)
      }
    });
  }
}

Router.on('init', () => {
  const homeURL = HomeState.buildURL();

  D(Router.templateParams).deepAssign({
    urls: {
      home: homeURL
    },
    headerParams: {
      homeLink: 'Boarder'.link(homeURL)
    }
  });
});

export default HomeState;
