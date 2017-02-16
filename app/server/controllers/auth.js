const _ = require('lodash');
const { isEmail } = require('validator');
const User = require('../db/models/user');
const {
  sendEmail,
  buildURL,
  generateUID
} = require('../helpers');
const hashPassword = require('../helpers/hash-password');
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
        from: registerFrom
      },
      forgotPassword: {
        from: forgotPasswordFrom
      }
    }
  }
} = require('../../config/config.json');

const registerConfirmationPath = apiBase + usersBase + confirmRegisterBase;
const resetPasswordPath = '/reset_password';
const FIELD_MUST_BE_UNIQUE = 'field_must_be_unique';
const VALUE_IS_NOT_EMAIL = 'value_is_not_email';
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
      body: {
        email = '',
        login = '',
        password = ''
      }
    } = req;

    User
      .create({
        email,
        login,
        password,
        confirmToken: generateUID(40)
      })
      .then((user) => {
        sendConfirmationEmail(req, user);
        res.json({ errors: null });
      })
      .catch((err) => {
        let { errors } = err;

        if (!errors) {
          throw err;
        }

        errors = errors.reduce((errors, { message, path }) => {
          message = registerValidatorSwitcher(message);

          if (message) {
            errors[path] = message;
          }

          return errors;
        }, {});

        res.json({ errors: _.isEmpty(errors) ? null : errors });
      })
      .catch(next);
  },
  confirmRegister(req, res) {
    const {
      session,
      session: {
        user: sessionUser
      } = {},
      query: {
        email,
        token
      }
    } = req;

    User
      .findOne({
        where: {
          email,
          confirmToken: token
        }
      })
      .then((user) => {
        if (!user) {
          throw notAuthorizedError;
        }

        user.confirmed = true;
        user.confirmToken = null;

        return user.save();
      })
      .then((user) => (
        !session || !sessionUser || sessionUser.email !== user.email
          ? sessionUser
          : user.getSessionInfo()
      ))
      .then((user) => {
        session.user = user;

        return session.savePr();
      })
      .then(() => res.redirect('/?confirm_register=true'))
      .catch(() => res.redirect('/'));
  },
  sendOneMore(req, res, next) {
    const {
      query: { email },
      session: { user }
    } = req;

    if (!email && !user) {
      return next(notAuthorizedError);
    }

    const promise = email
      ? User
        .findOne({
          where: { email }
        })
      : Promise.resolve(user);

    promise
      .then((user) => {
        if (!user) {
          return false;
        }

        sendConfirmationEmail(req, user);

        return true;
      })
      .then((success) => res.json(success))
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
          return null;
        }

        return user
          .getSessionInfo()
          .then(() => {
            session.user = user;

            return session.savePr();
          })
          .then(() => user);
      })
      .then((user) => {
        res.json(user);
      })
      .catch(next);
  },
  logout(req, res, next) {
    req.session
      .destroyPr()
      .then(() => (
        res.json(true)
      ))
      .catch(next);
  },
  forgotPassword(req, res, next) {
    const {
      i18n,
      query: {
        email = ''
      },
      protocol
    } = req;

    if (!isEmail(email)) {
      return res.json(false);
    }

    User
      .findOne({
        where: { email }
      })
      .then((user) => {
        if (!user) {
          return false;
        }

        user.resetPasswordToken = generateUID(40);

        return user
          .save()
          .then(({ resetPasswordToken }) => {
            sendEmail({
              from: forgotPasswordFrom,
              to: email,
              subject: i18n.t('email.forgot_password.subject'),
              templatePath: 'email/forgot-password',
              locals: {
                i18n,
                resetPasswordLink: buildURL({
                  protocol,
                  host: req.get('host'),
                  path: resetPasswordPath,
                  query: {
                    email,
                    token: resetPasswordToken
                  }
                })
              }
            });

            return true;
          });
      })
      .then((success) => res.json(success))
      .catch(next);
  },
  resetPassword(req, res, next) {
    const {
      body: {
        email,
        password,
        token
      }
    } = req;

    User
      .findOne({
        where: {
          email,
          resetPasswordToken: token
        }
      })
      .then((user) => {
        if (!user) {
          return false;
        }

        user.password = hashPassword(password);
        user.resetPasswordToken = null;

        return user.save();
      })
      .then((user) => res.json(!!user))
      .catch(next);
  },
  changePassword(req, res, next) {
    const {
      body: {
        currentPassword,
        password
      },
      user
    } = req;

    if (user.password !== hashPassword(currentPassword)) {
      return res.json(false);
    }

    user.password = hashPassword(password);

    user
      .save()
      .then(() => (
        res.json(true)
      ))
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

function registerValidatorSwitcher(message) {
  /* eslint indent: 0 */
  switch (true) {
    case /unique/i.test(message): {
      return FIELD_MUST_BE_UNIQUE;
    }

    case /email/i.test(message): {
      return VALUE_IS_NOT_EMAIL;
    }

    default: {
      return null;
    }
  }
}

function sendConfirmationEmail(req, user) {
  const {
    i18n,
    protocol
  } = req;
  const {
    login,
    email,
    confirmToken
  } = user;

  sendEmail({
    from: registerFrom,
    to: email,
    subject: i18n.t('email.register.subject'),
    templatePath: 'email/register',
    locals: {
      i18n,
      login,
      confirmLink: buildURL({
        protocol,
        host: req.get('host'),
        path: registerConfirmationPath,
        query: {
          email,
          token: confirmToken
        }
      })
    }
  });
}
