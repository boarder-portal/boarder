const { constructEndpoints } = require('../../helpers');
const controllers = require('../../controllers/user');

module.exports = constructEndpoints('user', controllers);
