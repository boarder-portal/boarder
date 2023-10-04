import { z } from 'zod';

import { ApiMethodsSchema } from 'common/api';

export const userSchema = z.object({
  login: z.string(),
});

const auth = {
  login: {
    method: 'post',
    request: z.object({
      login: z.string(),
      password: z.string(),
    }),
    response: z.object({
      user: userSchema,
    }),
  },
  logout: {
    method: 'post',
  },
  register: {
    method: 'post',
    request: z.object({
      login: z.string(),
      password: z.string(),
    }),
    response: z.object({
      user: userSchema,
    }),
  },
} as const satisfies ApiMethodsSchema;

export default auth;
