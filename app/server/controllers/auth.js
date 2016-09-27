const D = require('dwayne');
const { isEmail } = require('validator');
const User = require('../db/models/user');
const hashPassword = require('../helpers/hash-password');
const {
  cookie: {
    name: cookieName
  }
} = require('../../config/constants.json');

const notAuthorizedError = new Error('Not authorized');

module.exports = {
  checkLogin(req, res, next) {
    const {
      login = ''
    } = req.query;

    User
      .findOne({
        where: { login }
      })
      .then((user) => {
        res.json({ error: user && 'Login must be unique' });
      })
      .catch(next);
  },

  checkEmail(req, res, next) {
    const {
      email = ''
    } = req.query;

    if (!isEmail(email)) {
      return res.json({ error: 'Validation isEmail failed' });
    }

    User
      .findOne({
        where: { email }
      })
      .then((user) => {
        res.json({
          error: user && 'Email must be unique'
        });
      })
      .catch(next);
  },

  register(req, res, next) {
    const {
      email = '',
      login = '',
      password = ''
    } = req.body;

    User
      .create({
        email,
        login,
        password
      })
      .then(() => {
        res.json({ errors: null });
      })
      .catch((err) => {
        const { errors } = err;

        if (!errors) {
          return next(err);
        }

        res.json({
          errors: errors.map(({ message, path }) => ({
            field: path,
            message
          }))
        });
      });
  },

  login(req, res, next) {
    const {
      body: {
        login = '',
        password: origPassword = ''
      },
      session
    } = req;
    const password = hashPassword(origPassword);
    const where = isEmail(login)
      ? { email: login, password }
      : { login, password };

    User
      .findOne({ where })
      .then((user) => {
        if (!user) {
          return res.json(null);
        }

        session.user = user;
        session.save();

        res.json(user);
      })
      .catch(next);
  },

  auth(req, res, next) {
    const {
      cookies,
      session
    } = req;

    const cookie = cookies[cookieName];

    if (!cookie) {
      return next();
    }

    User.findOne({
      where: { email }
    })
      .catch((err) => {
        console.log(err);

        return null;
      })
      .then((user) => {
        session.user = user;
        session.save();
      });
  },

  socketAuth(socket, next) {
    const {
      request: {
        session: { user }
      }
    } = socket;

    if (!user) {
      return next(notAuthorizedError);
    }

    socket.user = user;

    next();
  }
};
