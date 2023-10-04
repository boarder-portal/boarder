import { z } from 'zod';

import auth from 'common/api/auth';

export type Api = typeof api;

export type ApiType = string & keyof typeof api;

export type ApiMethodType<Type extends ApiType> = string & keyof Api[Type];

export type ApiMethodsSchema = {
  [Path in string]: {
    method: 'get' | 'post';
    request?: z.ZodObject<any>;
    response?: z.ZodObject<any>;
  };
};

export type ApiMethodDescription<Type extends ApiType, MethodType extends ApiMethodType<Type>> = Api[Type][MethodType];

export type ApiMethodRequest<Type extends ApiType, MethodType extends ApiMethodType<Type>> = ApiMethodDescription<
  Type,
  MethodType
> extends { request: z.ZodObject<any> }
  ? z.infer<ApiMethodDescription<Type, MethodType>['request']>
  : null | undefined | void;

export type ApiMethodResponse<Type extends ApiType, MethodType extends ApiMethodType<Type>> = ApiMethodDescription<
  Type,
  MethodType
> extends { response: z.ZodObject<any> }
  ? z.infer<ApiMethodDescription<Type, MethodType>['response']>
  : null | undefined | void;

export const API_ROOT = '/api';

const api = {
  auth,
};

export default api;
