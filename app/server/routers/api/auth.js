const { constructEndpoints } = require('../../helpers');
const controllers = require('../../controllers/auth');

module.exports = constructEndpoints('users', controllers);
