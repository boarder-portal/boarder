const { constructEndpoints } = require('../../helpers');
const controllers = require('../../controllers/lang');

module.exports = constructEndpoints('lang', controllers);
