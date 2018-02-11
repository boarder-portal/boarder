import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { gameDataType, playersType } from '../constants';
import { games as gamesConfig } from '../../config/constants.json';

import Pexeso from './Pexeso';
import SurvivalOnline from './SurvivalOnline';

const {
  global: {
    playerRoles: {
      PLAYER
    }
  }
} = gamesConfig;

/* eslint-disable camelcase */
const GAMES_MAP = {
  pexeso: Pexeso,
  survival_online: SurvivalOnline
};
/* eslint-enable camelcase */

class Game extends Component {
  static propTypes = {
    role: PropTypes.number.isRequired,
    game: PropTypes.string.isRequired,
    gameData: gameDataType,
    players: playersType,
    socket: PropTypes.object.isRequired,
    emitter: PropTypes.object.isRequired,
    isMyTurn: PropTypes.bool.isRequired
  };

  removeListeners = [];

  gameRef = (component) => {
    if (!component) {
      this.removeListeners.forEach((removeListener) => removeListener());

      return;
    }

    const {
      game,
      emitter
    } = this.props;
    let Component = GAMES_MAP[game];

    if (Component.getWrappedInstance) {
      Component = Component.getWrappedInstance();
    }

    if (component.getWrappedInstance) {
      component = component.getWrappedInstance();
    }

    _.forEach(Component.listeners, (listener, event) => {
      this.removeListeners.push(emitter.on(event, component[listener]));
    });
  };

  emit = (...args) => {
    const {
      role,
      socket
    } = this.props;

    if (role === PLAYER) {
      socket.emit(...args);
    }
  };

  render() {
    const {
      game,
      gameData,
      players,
      isMyTurn
    } = this.props;
    const EventualGame = GAMES_MAP[game];

    return (
      <EventualGame
        ref={this.gameRef}
        gameData={gameData}
        players={players}
        isMyTurn={isMyTurn}
        emit={this.emit}
      />
    );
  }
}

export default Game;
