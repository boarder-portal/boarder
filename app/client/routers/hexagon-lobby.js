import { D, Router, isNull } from 'dwayne';
import GamesListState from './games-list';
import HexagonState from './hexagon';
import HexagonRoomState from './hexagon-room';
import Lobby from '../classes/lobby';
import { extend } from '../helpers';
import { games as gamesConfig } from '../../config/constants.json';

const {
  hexagon: { LOBBY_NSP }
} = gamesConfig;

class HexagonLobbyState extends HexagonState {
  static stateName = 'hexagon-lobby';
  static path = '/';
  static templateParams = {
    colCount: 4,
    gameName: 'hexagon'
  };

  roomState = HexagonRoomState;
  nsp = LOBBY_NSP;

  getRoomData(room) {
    return [
      {
        name: 'name',
        value: room.name
      },
      {
        name: 'status',
        value: room.status
      },
      {
        name: 'players',
        value: room.playersCount - D(room.players).sum(isNull)
      }
    ];
  }
}

extend(HexagonState, Lobby);

Router.on('init', () => {
  D(GamesListState.templateParams).deepAssign({
    gamesLinks: {
      hexagon: HexagonLobbyState.buildURL()
    }
  });
});

export default HexagonLobbyState;
