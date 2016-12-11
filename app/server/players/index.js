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

  constructor(props) {
    D(this).assign({
      ready: false,
      active: false,
      score: 0,
      sockets: D({})
    }, props);
  }

  /**
   * @method Player#toggleStatus
   * @public
   */
  toggleStatus() {
    this.ready = !this.ready;
  }

  toJSON() {
    const {
      login,
      avatar,
      ready,
      active,
      score
    } = this;

    return {
      login,
      avatar,
      ready,
      active,
      score
    };
  }
}

module.exports = Player;
