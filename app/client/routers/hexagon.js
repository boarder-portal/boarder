import GamesState from './games';
import HexagonStateTemplate from '../views/states/hexagon.pug';

class HexagonState extends GamesState {
  static abstract = true;
  static stateName = 'hexagon';
  static path = '/hexagon';
  static template = HexagonStateTemplate;
}

export default HexagonState;
