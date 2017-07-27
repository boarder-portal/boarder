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
const NOT_AUTHORIZED_ERROR = new Error('Not authorized');

module.exports = {
  async checkLogin(ctx) {
    const {
      login = ''
    } = ctx.query;
    const user = await User.findOne({
      where: { login }
    });

    ctx.json({
      error: user && FIELD_MUST_BE_UNIQUE
    });
  },
  async checkEmail(ctx) {
    const {
      email = ''
    } = ctx.query;

    if (!isEmail(email)) {
      return ctx.json({
        error: VALUE_IS_NOT_EMAIL
      });
    }

    const user = await User.findOne({
      where: { email }
    });

    ctx.json({
      error: user && FIELD_MUST_BE_UNIQUE
    });
  },
  async register(ctx) {
    const {
      request: {
        body: {
          email = '',
          login = '',
          password = ''
        }
      }
    } = ctx;

    try {
      const user = await User.create({
        email,
        login,
        password,
        confirmToken: generateUID(40)
      });

      await sendConfirmationEmail(ctx, user);

      ctx.json({
        errors: null
      });
    } catch (err) {
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

      ctx.json({
        errors: _.isEmpty(errors)
          ? null
          : errors
      });
    }
  },
  async confirmRegister(ctx) {
    const {
      query: {
        email,
        token
      }
    } = ctx;
    const user = await User.findOne({
      where: {
        email,
        confirmToken: token
      }
    });

    if (!user) {
      ctx.reject('WRONG_EMAIL_OR_TOKEN');
    }

    user.confirmed = true;
    user.confirmToken = null;

    await user.save();

    ctx.redirect('/?confirm_register=true');
  },
  async sendOneMore(ctx) {
    const {
      query: { email }
    } = ctx;
    let {
      session: { user }
    } = ctx;

    if (email) {
      user = await User.findOne({
        where: { email }
      });

      if (!user) {
        ctx.reject('NO_SUCH_EMAIL_REGISTERED');
      }
    } else if (!user) {
      ctx.reject('NOT_AUTHORIZED');
    }

    await sendConfirmationEmail(ctx, user);

    ctx.success();
  },
  async login(ctx) {
    const {
      request: {
        body: {
          login = '',
          password: origPassword = ''
        }
      },
      session
    } = ctx;

    const password = hashPassword(origPassword);
    const user = await User.findOne({
      where: isEmail(login)
        ? { email: login, password }
        : { login, password }
    });

    if (!user) {
      ctx.reject('WRONG_LOGIN_OR_PASSWORD');
    }

    await user.getSessionInfo();

    session.user = user;

    await session.savePr();

    ctx.json(user);
  },
  async logout(ctx) {
    await ctx.session.destroyPr();

    ctx.success();
  },
  async forgotPassword(ctx) {
    const {
      i18n,
      query: {
        email = ''
      },
      protocol
    } = ctx;

    if (!isEmail(email)) {
      ctx.reject('WRONG_EMAIL');
    }

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      ctx.reject('NO_SUCH_EMAIL_REGISTERED');
    }

    const resetPasswordToken = user.resetPasswordToken = generateUID(40);

    await user.save();
    await sendEmail({
      from: forgotPasswordFrom,
      to: email,
      subject: i18n.t('email.forgot_password.subject'),
      templatePath: 'email/forgot-password',
      locals: {
        i18n,
        resetPasswordLink: buildURL({
          protocol,
          host: ctx.get('host'),
          path: resetPasswordPath,
          query: {
            email,
            token: resetPasswordToken
          }
        })
      }
    });

    ctx.success();
  },
  async resetPassword(ctx) {
    const {
      request: {
        body: {
          email,
          password,
          token
        }
      }
    } = ctx;
    const user = await User.findOne({
      where: {
        email,
        resetPasswordToken: token
      }
    });

    if (!user) {
      ctx.reject('WRONG_EMAIL_OR_TOKEN');
    }

    user.password = hashPassword(password);
    user.resetPasswordToken = null;

    await user.save();

    ctx.success();
  },
  async changePassword(ctx) {
    const {
      request: {
        body: {
          currentPassword,
          password
        }
      },
      user
    } = ctx;

    if (user.password !== hashPassword(currentPassword)) {
      ctx.reject('WRONG_PASSWORD');
    }

    user.password = hashPassword(password);

    await user.save();

    ctx.success();
  },
  async socketSession(socket, next) {
    const {
      request: req
    } = socket;

    try {
      await session({
        req,
        res: req.res
      }, () => next());
    } catch (err) {
      next(err);
    }
  },
  socketAuth(socket, next) {
    const {
      request: {
        session: { user }
      }
    } = socket;

    if (!user) {
      return next(NOT_AUTHORIZED_ERROR);
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

function sendConfirmationEmail(ctx, user) {
  const {
    i18n,
    protocol
  } = ctx;
  const {
    login,
    email,
    confirmToken
  } = user;

  return sendEmail({
    from: registerFrom,
    to: email,
    subject: i18n.t('email.register.subject'),
    templatePath: 'email/register',
    locals: {
      i18n,
      login,
      confirmLink: buildURL({
        protocol,
        host: ctx.get('host'),
        path: registerConfirmationPath,
        query: {
          email,
          token: confirmToken
        }
      })
    }
  });
}
