import { hash, verify } from 'argon2';
import { Schema } from 'mongoose';

import { User } from 'common/types';
import { ModelInstance } from 'server/types/mongoose';

import db from 'server/db';

const userSchema = new Schema(
  {
    login: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    methods: {
      getId(): string {
        return String(this._id);
      },
      toData(): User {
        return {
          login: this.login,
        };
      },
      async validatePassword(password: string): Promise<boolean> {
        return verify(this.password ?? '', password);
      },
    },
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await hash(this.password ?? '');

    return next();
  } catch (err) {
    return next(err instanceof Error ? err : new Error('Hash failed'));
  }
});

const UserModel = db.model('user', userSchema, 'users');

export type UserDbInstance = ModelInstance<typeof UserModel>;

export default UserModel;
