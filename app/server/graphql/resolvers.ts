import { ILoginParams, IRegisterParams } from 'common/types/requestParams';
import { IUser } from 'common/types';
import { ISession } from 'server/types';

import getDB from 'server/db/getDB';
import writeDB from 'server/db/writeDB';

const resolvers = {
  Query: {
    async getUser(_: void, __: void, context: { session: ISession }): Promise<IUser | null> {
      return context.session.user || null;
    },
  },
  Mutation: {
    async register(parent: void, { user }: IRegisterParams): Promise<IUser> {
      const db = await getDB();

      db.users.push(user);

      await writeDB(db);

      return {
        login: user.login,
      };
    },
    async login(parent: void, { user }: ILoginParams, context: { session: ISession }): Promise<IUser> {
      const db = await getDB();

      const authUser = db.users.find(({ login, password }) => login === user.login && password === user.password);

      if (!authUser) {
        throw new Error('No such user.');
      }

      context.session.user = {
        login: authUser.login,
      };

      return {
        login: authUser.login,
      };
    },
  },
};

export default resolvers;
