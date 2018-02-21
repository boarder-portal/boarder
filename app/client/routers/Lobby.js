import _ from 'lodash';
import React, { Component } from 'react';
import io from 'socket.io-client';

import { matchType } from '../constants';
import { setPageTitle, whenLoggedIn } from '../helpers';
import { getLobbyNsp } from '../../shared/games';
import { games as gamesConfig } from '../../shared/constants';

import { Input, Caption } from '../components';

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
  },
  pexeso: {
    sets: pexesoSets
  }
} = gamesConfig;

class Lobby extends Component {
  static propTypes = {
    match: matchType.isRequired
  };

  state = {
    rooms: {},
    pexesoChosenSet: 'lost'
  };

  componentDidMount() {
    const {
      match: {
        params: {
          game
        }
      }
    } = this.props;
    const nsp = getLobbyNsp(game);
    const socket = this.socket = io.connect(nsp, {
      forceNew: true
    });

    socket.on(GET_LIST, this.onListReceived);
    socket.on(NEW_ROOM, this.onNewRoom);
    socket.on(UPDATE_ROOM, this.onUpdateRoom);
    socket.on(DELETE_ROOM, this.onDeleteRoom);
    socket.on('connect', () => {
      console.log('connected to lobby');
    });
    socket.on('error', (err) => {
      this.router.go('login');

      console.log(err);
    });
    socket.on('disconnect', () => {
      console.log('disconnected from lobby');
    });

    setPageTitle(`${game}_caption`, 'games');
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  getRoomOptions() {
    const {
      match: {
        params: {
          game
        }
      }
    } = this.props;
    const {
      pexesoChosenSet
    } = this.state;

    /* eslint indent: 0 */
    switch (game) {
      case 'pexeso': {
        return {
          set: pexesoChosenSet
        };
      }

      default: {
        return {};
      }
    }
  }

  onChangePexesoSet = (pexesoChosenSet) => {
    this.setState({
      pexesoChosenSet
    });
  };

  onCreateRoomClick = () => {
    this.socket.emit(NEW_ROOM, this.getRoomOptions());
  };

  onListReceived = (rooms) => {
    this.setState({
      rooms
    });
  };

  onNewRoom = (room) => {
    this.setState(({ rooms }) => ({
      rooms: {
        ...rooms,
        [room.id]: room
      }
    }));
  };

  onUpdateRoom = (room) => {
    this.setState(({ rooms }) => ({
      rooms: {
        ...rooms,
        [room.id]: room
      }
    }));
  };

  onDeleteRoom = (id) => {
    this.setState(({ rooms }) => ({
      rooms: _.omit(rooms, id)
    }));
  };

  render() {
    const {
      rooms,
      pexesoChosenSet
    } = this.state;

    return (
      <div className="route route-lobby">
        <table className={`rooms-table ${game}-rooms-table`}>

          <thead>
            <tr>

              <th className="room-name">
                <Caption value="games.global.lobby.col_names.name" />
              </th>

              <th className="room-status">
                <Caption value="games.global.lobby.col_names.status" />
              </th>

              {game === 'pexeso' && (
                <th className="room-set">
                  <Caption value="games.pexeso.lobby.col_names.set" />
                </th>
              )}

              <th className="room-players">
                <Caption value="games.global.lobby.col_names.players" />
              </th>

              <th className="room-actions">
                <Caption value="games.global.lobby.col_names.actions" />
              </th>

            </tr>
          </thead>

          <tbody className={`rooms ${game}-rooms`}>

            {_.map(rooms, (room) => (
              <tr key={room.id} className={`room ${game}-room`}>

                <td className="room-name">
                  {room.name}
                </td>

                <td className="room-status">
                  <Caption value={`games.global.lobby.room_statuses.${room.status}`} />
                </td>

                {game === 'pexeso' && (
                  <td className="room-set">
                    {room.gameOptions.set}
                  </td>
                )}

                <td className="room-players">
                  <div className="players-container">
                    {room.players.map((player, index) => (
                      <div key={player ? `id-${player.id}` : `ix-${index}`} className="avatar-container">
                        <img className="avatar" src={player && player.avatar}/>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="room-actions">
                  <Link className="play-link" to={`/games/${game}/${room.id}`}>
                    <i className="fa fa-sign-in enter-room" />
                  </Link>
                  <Link className="observe-link" to={`/games/${game}/${room.id}?observe`}>
                    <i className="fa fa-eye enter-room" />
                  </Link>
                </td>

              </tr>
            ))}

            <tr>

              <td className="room-name" />

              <td className="room-status" />

              {game === 'pexeso' && (
                <td className="room-set">
                  <select value={pexesoChosenSet} onChange={this.onChangePexesoSet}>
                    {pexesoSets.map((set) => (
                      <option key={set} value={set}>
                        {set}
                      </option>
                    ))}
                  </select>
                </td>
              )}

              <td className="room-players" />

              <td className="room-actions">
                <Input
                  className="success create-room-btn"
                  type="submit"
                  value="games.global.lobby.create_room"
                  onClick={this.onCreateRoomClick}
                />
              </td>

            </tr>

          </tbody>

        </table>
      </div>
    );
  }
}

export default whenLoggedIn(Lobby);
