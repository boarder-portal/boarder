const D = require('dwayne');
const { isEmail } = require('validator');
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
  method,
  alphabet,
  switcher
} = D;
const FIELD_MUST_BE_UNIQUE = 'field_must_be_unique';
const VALUE_IS_NOT_EMAIL = 'value_is_not_email';
const notAuthorizedError = new Error('Not authorized');
const confirmEmailAlphabet = alphabet('0-9a-zA-Z');
const registerValidatorSwitcher = switcher('call', null)
  .case(method('test', [/unique/i]), FIELD_MUST_BE_UNIQUE)
  .case(method('test', [/email/i]), VALUE_IS_NOT_EMAIL);

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
        res.json({ error: user && FIELD_MUST_BE_UNIQUE });
      })
      .catch(next);
  },

  checkEmail(req, res, next) {
    const {
      email = ''
    } = req.query;

    if (!isEmail(email)) {
      return res.json({ error: VALUE_IS_NOT_EMAIL });
    }

    User
      .findOne({
        where: { email }
      })
      .then((user) => {
        res.json({
          error: user && FIELD_MUST_BE_UNIQUE
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
        user.confirmToken = confirmEmailAlphabet.token(40);

        return user.save();
      })
      .then(({ confirmToken }) => (
        sendEmail({
          from: {
            name: registerFromName,
            email: registerFromEmail
          },
          to: email,
          subject: registerSubject,
          viewPath: 'email/register',
          locals: {
            i18n,
            login,
            confirmLink: `${ origin }/confirm_register?token=${ confirmToken }`
          }
        })
      ))
      .then(() => res.json({ errors: null }))
      .catch((err) => {
        let { errors } = err;

        if (!errors) {
          throw err;
        }

        errors = errors.reduce((errors, { message, path }) => {
          message = registerValidatorSwitcher(message);

          if (message) {
            errors.push({
              field: path,
              message
            });
          }

          return errors;
        }, []);

        res.json(errors.length ? errors : null);
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
