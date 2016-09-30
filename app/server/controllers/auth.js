const D = require('dwayne');
const path = require('path');
const { isEmail } = require('validator');
const pug = require('pug');
const User = require('../db/models/user');
const hashPassword = require('../helpers/hash-password');
const sendEmail = require('../helpers/send-email');
const { session } = require('./session');
const {
  mail: {
    emails: {
      register: {
        from: {
          name: registerFromName,
          email: registerFromEmail
        },
        subject: registerSubject
      }
    }
  }
} = require('../../config/config.json');

const {
  alphabet: Alphabet
} = D;
const notAuthorizedError = new Error('Not authorized');
const alphabet = Alphabet('0-9a-zA-Z');

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
      i18n,
      body: {
        email = '',
        login = '',
        password = ''
      },
      protocol
    } = req;
    const origin = `${ protocol }://${  req.get('host') }`;

    User
      .create({
        email,
        login,
        password
      })
      .then((user) => {
        user.confirmToken = alphabet.token(40);

        return user.save();
      })
      .then(({ confirmToken }) => {
        const confirmLink = `${ origin }/confirm_register?token=${ confirmToken }`;

        return sendEmail({
          from: {
            name: registerFromName,
            email: registerFromEmail
          },
          to: email,
          subject: registerSubject,
          viewPath: 'email/register',
          locals: {
            login,
            welcomeCaption: i18n.t('register.welcome_caption'),
            confirmLink: confirmLink.link(confirmLink)
          }
        });
      })
      .catch((err) => {
        const { errors } = err;

        if (!errors) {
          throw err;
        }

        res.json(errors.map(({ message, path }) => ({
          field: path,
          message
        })));
      })
      .catch(next);
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

  socketSession(socket, next) {
    const {
      request: req
    } = socket;

    session(req, req.res, next);
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
