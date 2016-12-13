const D = require('dwayne');

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
   * @member {Super} Player#sockets
   * @public
   */
  /**
   * @member {Number} Player#score
   * @public
   */
  /**
   * @member {Object} Player#data
   * @public
   */

  constructor(props) {
    D(this).assign({
      ready: false,
      active: false,
      score: 0,
      sockets: D({}),
      data: {}
    }, props);
  }

  toJSON() {
    const {
      login,
      avatar,
      ready,
      active,
      score,
      data
    } = this;

    return {
      login,
      avatar,
      ready,
      active,
      score,
      data
    };
  }
}

module.exports = Player;
