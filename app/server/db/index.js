import Sequelize from 'sequelize';

import config from './config';

export default new Sequelize(config[process.env.NODE_ENV]);
