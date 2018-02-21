import _ from 'lodash';
import validator from 'validator';

import User from '../db/models/user';
import {
  sendEmail,
  buildURL,
  generateUID
} from '../helpers';
import hashPassword from '../helpers/hash-password';
import { session } from './session';
import { endpoints } from '../../shared/constants';
import config from '../config';

const {
  base: apiBase,
  users: {
    base: usersBase,
    confirmRegister: {
      base: confirmRegisterBase
    }
  }
} = endpoints;

const registerConfirmationPath = apiBase + usersBase + confirmRegisterBase;
const resetPasswordPath = '/reset_password';
const FIELD_MUST_BE_UNIQUE = 'field_must_be_unique';
const VALUE_IS_NOT_EMAIL = 'value_is_not_email';
const NOT_AUTHORIZED_ERROR = new Error('Not authorized');

export async function checkLogin(ctx) {
  const {
    login = ''
  } = ctx.query;
  const user = await User.findOne({
    where: { login }
  });

  ctx.json({
    error: user && FIELD_MUST_BE_UNIQUE
  });
}

export async function checkEmail(ctx) {
  const {
    email = ''
  } = ctx.query;

  if (!validator.isEmail(email)) {
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
}

export async function register(ctx) {
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

    sendConfirmationEmail(ctx, user);

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
}

export async function confirmRegister(ctx) {
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

  ctx.redirect('/?register_confirmed');
}

export async function sendOneMore(ctx) {
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

  sendConfirmationEmail(ctx, user);

  ctx.success();
}

export async function login(ctx) {
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
    where: validator.isEmail(login)
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
}

export async function logout(ctx) {
  await ctx.session.destroyPr();

  ctx.success();
}

export async function forgotPassword(ctx) {
  const {
    i18n,
    query: {
      email = ''
    },
    protocol
  } = ctx;

  if (!validator.isEmail(email)) {
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
    from: config.mail.emails.forgotPassword.from,
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
}

export async function resetPassword(ctx) {
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
}

export async function changePassword(ctx) {
  const {
    request: {
      body: {
        currentPassword,
        newPassword
      }
    },
    user
  } = ctx;

  if (user.password !== hashPassword(currentPassword)) {
    ctx.reject('WRONG_PASSWORD');
  }

  user.password = hashPassword(newPassword);

  await user.save();

  ctx.success();
}

export async function socketSession(socket, next) {
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
}

export async function socketAuth(socket, next) {
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
    from: config.mail.emails.register.from,
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
