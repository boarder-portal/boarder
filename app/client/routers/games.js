import { Router } from 'dwayne';
import GamesStateTemplate from '../views/states/games.pug';

class GamesState extends Router {
  static abstract = true;
  static stateName = 'games';
  static path = '/games';
  static template = GamesStateTemplate;
}

export default GamesState;
