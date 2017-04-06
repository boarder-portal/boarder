const _ = require('lodash');
const {
  games: {
    global: {
      events: {
        game: {
          UPDATE_GAME
        }
      }
    }
  }
} = require('../../config/constants.json');

const PUBLIC_FIELDS = [
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

  pureEmit() {
    _.forEach(this.sockets, (socket) => {
      socket.emit(...arguments);
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

module.exports = Player;
