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
   * @member {String} Player#color
   * @public
   */
  /**
   * @member {Object} Player#data
   * @public
   */

  constructor(props) {
    this.sockets = D({});

    D(this).assign(props);
    this.setInitialGameState();
  }

  setInitialGameState() {
    D(this).assign({
      ready: false,
      active: false,
      score: 0,
      data: {}
    });
  }

  toJSON() {
    const {
      login,
      avatar,
      ready,
      active,
      score,
      color,
      data
    } = this;

    return {
      login,
      avatar,
      ready,
      active,
      score,
      color,
      data
    };
  }
}

module.exports = Player;
