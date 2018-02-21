'use strict';

/* eslint camelcase: 0 */

import hashPassword from '../../helpers/hash-password';

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
  },
  {
    login: '1',
    email: 'a1@a.com',
    password: '123',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    login: '2',
    email: 'a2@a.com',
    password: '123',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    login: '3',
    email: 'a3@a.com',
    password: '123',
    created_at: new Date(),
    updated_at: new Date()
  }
];

users.forEach((user) => {
  user.password = hashPassword(user.password);
});

export async function up(queryInterface) {
  return queryInterface.bulkInsert(TABLE_NAME, users, {});
}

export async function down(queryInterface) {
  return queryInterface.bulkDelete(TABLE_NAME, null, {});
}
