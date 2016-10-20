const D = require('dwayne');
const {
  games: {
    global: {
      playerStatuses: {
        NOT_READY,
        READY
      }
    }
  }
} = require('../../config/constants.json');

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
   * @member {Number} Player#status
   * @public
   */
  /**
   * @member {Super} Player#sockets
   * @public
   */

  constructor(props) {
    D(this).assign({
      status: NOT_READY,
      sockets: D({})
    }, props);
  }

  /**
   * @method Player#isReady
   * @public
   * @returns {Boolean}
   */
  isReady() {
    return this.status === READY;
  }

  /**
   * @method Player#toggleStatus
   * @public
   */
  toggleStatus() {
    this.status = this.status === READY ? NOT_READY : READY;
  }

  toJSON() {
    const {
      login,
      avatar,
      status
    } = this;

    return {
      login,
      avatar,
      status
    };
  }
}

module.exports = Player;
