import { D, Router } from 'dwayne';
import GamesListState from './games-list';
import HexagonState from './hexagon';
import HexagonRoomState from './hexagon-room';
import LobbyTemplate from '../views/partials/lobby.pug';
import { lobbyElements } from '../constants';
import { games as gamesConfig } from '../../config/constants.json';

const {
  hexagon: { LOBBY_NSP }
} = gamesConfig;

class HexagonLobbyState extends HexagonState {
  static stateName = 'hexagon-lobby';
  static path = '/';
  static template = LobbyTemplate;
  static templateParams = {
    colCount: 0,
    gameName: 'hexagon'
  };
  static elements = D({})
    .deepAssign(lobbyElements)
    .$;

  roomState = HexagonRoomState;
  nsp = LOBBY_NSP;
}

Router.on('init', () => {
  D(GamesListState.templateParams).deepAssign({
    gamesLinks: {
      hexagon: HexagonLobbyState.buildURL()
    }
  });
});

export default HexagonLobbyState;
