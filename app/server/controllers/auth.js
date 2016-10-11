const D = require('dwayne');
const { isEmail } = require('validator');
const User = require('../db/models/user');
const {
  hashPassword,
  sendEmail,
  buildURL
} = require('../helpers');
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

const {
  alphabet,
  switcher
} = D;
const registerConfirmationPath = apiBase + usersBase + confirmRegisterBase;
const resetPasswordPath = '/reset-password';
const FIELD_MUST_BE_UNIQUE = 'field_must_be_unique';
const VALUE_IS_NOT_EMAIL = 'value_is_not_email';
const notAuthorizedError = new Error('Not authorized');
const confirmEmailAlphabet = alphabet('0-9a-zA-Z');
const resetPasswordAlphabet = alphabet('0-9a-zA-Z');
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
        confirmToken: confirmEmailAlphabet.token(40)
      })
      .then((user) => {
        user.confirmToken = confirmEmailAlphabet.token(40);

        return user.save();
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
      .then((user) => {
        if (!session || !sessionUser || sessionUser.email !== user.email) {
          return;
        }

        session.user = user;

        return new Promise((resolve) => {
          session.save(resolve);
        });
      })
      .then(() => res.redirect('/?confirmRegister=true'))
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
          return res.json(false);
        }

        sendConfirmationEmail(req, user);
        res.json(true);
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

        user.resetPasswordToken = resetPasswordAlphabet.token(40);

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

  console.log(i18n);

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
