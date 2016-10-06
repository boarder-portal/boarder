import io from 'socket.io-client';
import { D, doc } from 'dwayne';
import LoginState from '../routers/login';
import LobbyTemplate from '../views/partials/lobby.pug';
import RoomRowTemplate from '../views/partials/room-row.pug';
import { games as gamesConfig } from '../../config/constants.json';

const {
  global: {
    events: {
      lobby: {
        GET_LIST,
        NEW_ROOM,
        UPDATE_ROOM,
        DELETE_ROOM
      }
    }
  }
} = gamesConfig;

class Lobby {
  onRender() {
    const { base } = this;
    const createRoomBtn = base.find('.create-room-btn');

    createRoomBtn.on('click', this.onCreateRoomClick.bind(this));

    this.renderRoomsList({});
  }
}

export default Lobby;
