export default {
  port: 3333,
  cookieName: 'cookie',
  defaultAvatar: 'url',
  mail: {
    auth: {
      user: 'mail@example.com',
      pass: 'password'
    },
    emails: {
      register: {
        from: {
          name: 'name',
          email: 'email'
        }
      },
      forgotPassword: {
        from: {
          name: 'name',
          email: 'email'
        }
      }
    }
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  sessionExpires: 60000,
  secret: 'secret'
};
