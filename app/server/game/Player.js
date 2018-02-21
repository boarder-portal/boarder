import _ from 'lodash';

import { games } from '../../shared/constants';

const {
  UPDATE_GAME
} = games.global.events.game;

const PUBLIC_FIELDS = [
  'id',
  'login',
  'avatar',
  'ready',
  'active',
  'score',
  'color',
  'data'
];

/**
 * @class Player
 * @public
 */
class Player {
  /**
   * @member {String} Player#login
   * @public
   */
  /**
   * @member {String} Player#avatar
   * @public
   */
  /**
   * @member {Boolean} Player#ready
   * @public
   */
  /**
   * @member {Boolean} Player#active
   * @public
   */
  /**
   * @member {Object} Player#sockets
   * @public
   */
  /**
   * @member {Number} Player#score
   * @public
   */
  /**
   * @member {String} Player#color
   * @public
   */
  /**
   * @member {Object} Player#data
   * @public
   */

  constructor(props) {
    this.sockets = {};

    _.assign(this, props);
    this.setInitialGameState();
  }

  emit(event, data) {
    this.pureEmit(UPDATE_GAME, {
      event,
      data
    });
  }

  broadcast(event, data) {
    _.forEach(this.sockets, (socket) => {
      socket.broadcast.emit(UPDATE_GAME, {
        event,
        data
      });
    });
  }

  pureEmit(...args) {
    _.forEach(this.sockets, (socket) => {
      socket.emit(...args);
    });
  }

  setInitialGameState() {
    _.assign(this, {
      ready: false,
      active: false,
      score: 0,
      data: {}
    });
  }

  toJSON() {
    return _.pick(this, PUBLIC_FIELDS);
  }
}

export default Player;
