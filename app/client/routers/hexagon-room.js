import { D } from 'dwayne';
import HexagonState from './hexagon';
import RoomTemplate from '../views/partials/room.pug';
import { roomElements } from '../constants';
import { games as gamesConfig } from '../../config/constants.json';

const {
  hexagon: { ROOM_NSP }
} = gamesConfig;

class HexagonRoomState extends HexagonState {
  static stateName = 'hexagon-room';
  static path = '/:roomId';
  static template = RoomTemplate;
  static templateParams = {
    ready: false
  };
  static elements = D({})
    .deepAssign(roomElements)
    .$;

  nsp = ROOM_NSP;
}

export default HexagonRoomState;
