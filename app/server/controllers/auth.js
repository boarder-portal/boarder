const D = require('dwayne');
const { isEmail } = require('validator');
const User = require('../db/models/user');
const hashPassword = require('../helpers/hash-password');
const sendEmail = require('../helpers/send-email');
const { session } = require('./session');
const {
  endpoints: {
    base: apiBase,
    users: {
      base: usersBase,
      confirmRegister: {
        base: confirmRegisterBase
      }
    }
  }
} = require('../../config/constants.json');
const {
  mail: {
    emails: {
      register: {
        from: {
          name: registerFromName,
          email: registerFromEmail
        }
      }
    }
  }
} = require('../../config/config.json');

const {
  alphabet,
  switcher
} = D;
const FIELD_MUST_BE_UNIQUE = 'field_must_be_unique';
const VALUE_IS_NOT_EMAIL = 'value_is_not_email';
const notAuthorizedError = new Error('Not authorized');
const confirmEmailAlphabet = alphabet('0-9a-zA-Z');
const registerValidatorSwitcher = switcher('call', null)
  .case((message) => /unique/i.test(message), FIELD_MUST_BE_UNIQUE)
  .case((message) => /email/i.test(message), VALUE_IS_NOT_EMAIL);

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
    const base = `${ protocol }://${ req.get('host') + apiBase + usersBase + confirmRegisterBase }`;

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
      .then(({ confirmToken }) => {
        sendEmail({
          from: {
            name: registerFromName,
            email: registerFromEmail
          },
          to: email,
          subject: i18n.t('email.register.subject'),
          viewPath: 'email/register',
          locals: {
            i18n,
            login,
            confirmLink: `${ base }?login=${ login }&token=${ confirmToken }`
          }
        });
      })
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

        res.json({ errors: errors.length ? errors : null });
      })
      .catch(next);
  },
  confirmRegister(req, res) {
    const {
      query: {
        login,
        token
      }
    } = req;

    User
      .findOne({
        where: {
          login,
          confirmToken: token
        }
      })
      .then((user) => {
        if (user) {
          user.confirmed = true;
          user.confirmToken = null;

          return user.save();
        }
      })
      .catch(() => {})
      .then(() => res.redirect('/'));
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
