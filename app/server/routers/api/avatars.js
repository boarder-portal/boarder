const { constructEndpoints } = require('../../helpers');
const controllers = require('../../controllers/avatars');

module.exports = constructEndpoints('avatar', controllers);
