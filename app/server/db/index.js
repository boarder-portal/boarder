const sequelize = require('sequelize');
const config = require('./config.json');

module.exports = new sequelize(config[process.env.NODE_ENV]);
