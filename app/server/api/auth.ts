import { BadRequest, Conflict } from 'http-errors';

import ApiRouter from 'server/utilities/ApiRouter';

import UserModel from 'server/db/models/user';

export default new ApiRouter('auth', {
  async login(state, request) {
    const { login, password } = request;

    const user = await UserModel.findOne({ login });

    if (!user) {
      throw new BadRequest();
    }

    const isSamePassword = await user.validatePassword(password);

    if (!isSamePassword) {
      throw new BadRequest();
    }

    state.session.userId = user.getId();

    await state.session.asyncSave();

    return {
      user: user.toData(),
    };
  },

  async logout(state) {
    await state.session.asyncDestroy();
  },

  async register(state, request) {
    const { login, password } = request;

    const userWithLogin = await UserModel.findOne({ login });

    if (userWithLogin) {
      throw new Conflict();
    }

    const user = await UserModel.create({
      login,
      password,
    });

    state.session.userId = user.getId();

    await state.session.asyncSave();

    return {
      user: user.toData(),
    };
  },
});
