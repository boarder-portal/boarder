const constructEndpoints = require('../../helpers/construct-endpoints');
const controllers = require('../../controllers/auth');

module.exports = constructEndpoints('users', controllers);
