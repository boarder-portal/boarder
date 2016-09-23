'use strict';

/* eslint camelcase: 0 */

const hashPassword = require('../../helpers/hash-password');

const TABLE_NAME = 'users';

const users = [
  {
    login: 'bobby',
    email: 'a123@a.com',
    password: '123',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    login: '123',
    email: 'a@a.com',
    password: '123',
    created_at: new Date(),
    updated_at: new Date()
  }
];

users.forEach((user) => {
  user.password = hashPassword(user.password);
});

module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert(TABLE_NAME, users, {});
  },

  down(queryInterface) {
    return queryInterface.bulkDelete(TABLE_NAME, null, {});
  }
};
