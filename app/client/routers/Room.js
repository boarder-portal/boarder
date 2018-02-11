import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import io from 'socket.io-client';
import ClassName from 'classnames';

import { matchType, historyType, userType } from '../constants';
import { setPageTitle, Emitter, getLocationQuery } from '../helpers';
import { games as gamesConfig } from '../../config/constants.json';

import { Input, Caption } from '../components';
import Game from '../gamers';

const {
  global: {
    roomStatuses: {
      NOT_PLAYING,
      PREPARING,
      PLAYING,
      FINISHING
    },
    playerRoles: {
      OBSERVER,
      PLAYER
    },
    events: {
      room: {
        ENTER_ROOM,
        UPDATE_ROOM,
        TOGGLE_PLAYER_STATUS
      },
      game: {
        PREPARING_GAME,
        GAME_STARTED,
        GAME_FINISHING,
        GAME_FINISHED,
        UPDATE_PLAYERS,
        UPDATE_GAME
      }
    }
  }
} = gamesConfig;

class Room extends Component {
  static propTypes = {
    user: userType,
    history: historyType.isRequired,
    match: matchType.isRequired
  };

  state = {
    status: null,
    roomData: null,
    plannedRole: null,
    role: null,
    ready: null,
    gameData: null,
    players: [],
    isMyTurn: false
  };

  componentDidMount() {
    const {
      history,
      match: {
        url,
        params: {
          game,
          roomId
        }
      }
    } = this.props;
    const query = getLocationQuery();
    const observe = 'observe' in query;
    const nsp = gamesConfig[game].ROOM_NSP;
    const socket = this.socket = io.connect(nsp.replace(/\$roomId/, roomId), {
      forceNew: true,
      query: {
        role: observe ? OBSERVER : PLAYER
      }
    });

    this.emitter = new Emitter();

    this.setState({
      plannedRole: observe
        ? OBSERVER
        : PLAYER
    });

    socket.on(ENTER_ROOM, this.onEnterRoom);
    socket.on(UPDATE_ROOM, this.onUpdateRoom);
    socket.on(PREPARING_GAME, this.onPreparingGame);
    socket.on(GAME_STARTED, this.onGameStarted);
    socket.on(GAME_FINISHING, this.onGameFinishing);
    socket.on(GAME_FINISHED, this.onGameFinished);
    socket.on(UPDATE_PLAYERS, this.onUpdatePlayers);
    socket.on(UPDATE_GAME, this.onUpdateGame);
    socket.on('connect', () => {
      console.log('connected to room');
    });
    socket.on('error', (err) => {
      console.log(err);

      if (err === 'Invalid namespace') {
        history.replace(`/not-found?path=${encodeURIComponent(url)}`);
      }
    });
    socket.on('disconnect', () => {
      console.log('disconnected from room');
    });

    setPageTitle(`${game}_caption`, 'games');
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  startGame(gameData) {
    console.log(gameData);

    this.setState({
      gameData,
      status: PLAYING,
      players: gameData.players
    }, this.setIsMyTurn);
  }

  setIsMyTurn = () => {
    if (this.state.role === OBSERVER) {
      return;
    }

    const {
      user: {
        login
      }
    } = this.props;

    this.setState((state) => ({
      isMyTurn: _.find(state.players, (player) => player && player.login === login).active
    }));
  };

  toggleStatus = () => {
    this.socket.emit(TOGGLE_PLAYER_STATUS);
  };

  onEnterRoom = (roomData) => {
    this.setState({
      roomData: roomData.room,
      gameData: roomData.room.game,
      status: roomData.room.status,
      role: roomData.role,
      ready: false
    });

    if (roomData.room.game) {
      this.startGame(roomData.room.game);
    }
  };

  onUpdateRoom = (roomData) => {
    const {
      user: {
        login
      }
    } = this.props;

    if (this.state.role === OBSERVER) {
      this.setState({
        roomData
      });

      return;
    }

    this.setState({
      roomData,
      ready: _.find(roomData.players, (player) => player && player.login === login).ready
    });
  };

  onPreparingGame = () => {
    this.setState({
      status: PREPARING
    });
  };

  onGameStarted = (gameData) => {
    this.startGame(gameData);
  };

  onGameFinishing = (players) => {
    this.setState({
      status: FINISHING,
      players: _.sortByField(players, 'score', true)
    });
  };

  onGameFinished = () => {
    this.setState({
      status: NOT_PLAYING
    });
  };

  onUpdatePlayers = (players) => {
    this.setState({
      players
    }, this.setIsMyTurn);
  };

  onUpdateGame = ({ event, data, players }) => {
    if (players) {
      this.setState({
        players
      }, this.setIsMyTurn);
    } else {
      this.setIsMyTurn();
    }

    this.emitter.emit(event, data);
  };

  render() {
    const {
      user,
      match: {
        url,
        params: {
          game
        }
      }
    } = this.props;
    const {
      status,
      ready,
      role,
      isMyTurn,
      roomData,
      gameData,
      players,
      plannedRole
    } = this.state;

    if (!user) {
      return (
        <Redirect
          to={`/login?from=${encodeURIComponent(url)}`}
          push={false}
        />
      );
    }

    return (
      <div className="route route-room">
        {do {
          /* eslint-disable no-unused-expressions */
          if (status === NOT_PLAYING) {
            <div className="before-game">

              {plannedRole === PLAYER && role === OBSERVER && (
                <Caption value="games.global.room.observer_caption" />
              )}

              <div className="players-before-game-list">
                {roomData.players.map((player, index) => (
                  <div key={player ? `id-${player.id}` : `ix-${index}`} className="player-before-game-block">
                    {player && [

                      <div key="avatar" className="avatar-container">
                        <img className="avatar" src={player.avatar}/>
                      </div>,

                      <div key="login" className="login">
                        {player.login}
                      </div>,

                      <div key="ready" className={ClassName('ready-caption', {
                        ready: player.ready
                      })}>
                        <i className={`fa ${player.ready ? 'fa-check' : 'fa-times'}`} />
                        <Caption value={`games.global.room.${player.ready ? 'ready' : 'not_ready'}`} />
                      </div>

                    ]}
                  </div>
                ))}
              </div>

              {role === PLAYER && (
                <Input
                  className="success ready-to-play-btn"
                  type="submit"
                  value={`games.global.room.${ready ? 'not_ready' : 'ready'}`}
                  onClick={this.toggleStatus}
                />
              )}

            </div>;
          } else if (status === PREPARING) {
            <Caption
              tag="h1"
              className="text-center"
              value="games.global.room.preparing"
            />;
          } else if (status === PLAYING) {
            <div className="game-container">
              <Game
                game={game}
                gameData={gameData}
                socket={this.socket}
                emitter={this.emitter}
                isMyTurn={isMyTurn}
                players={players}
                role={role}
              />
            </div>;
          } else if (status === FINISHING) {
            <div className="game-results">
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="place">Place</th>
                    <th className="player">Player</th>
                    <th className="score">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={player.id}>
                      <td className="place">{index + 1}</td>
                      <td className="player">{player.login}</td>
                      <td className="score">{player.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>;
          } else {
            null;
          }
          /* eslint-enable no-unused-expressions */
        }}
      </div>
    );
  }
}

export default connect((state) => ({
  user: state.user
}))(Room);
