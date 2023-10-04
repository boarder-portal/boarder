import { ApiMethodRequest, ApiMethodResponse, ApiMethodType, ApiType } from 'common/api';

import { AnyAsyncValue } from 'client/types/async';
import { MaybePromise } from 'common/types/common';

import httpClient from 'client/utilities/HttpClient';

import useImmutableCallback from 'client/hooks/useImmutableCallback';
import usePromise from 'client/hooks/usePromise';

export type UseRequest<Type extends ApiType, MethodType extends ApiMethodType<Type>> = AnyAsyncValue<
  ApiMethodResponse<Type, MethodType>
> & {
  request(request: ApiMethodRequest<Type, MethodType>): Promise<ApiMethodResponse<Type, MethodType>>;
};

export default function useRequest<Type extends ApiType, MethodType extends ApiMethodType<Type>>(
  method: `${Type}.${MethodType}`,
): UseRequest<Type, MethodType> {
  const { run, ...asyncValue } = usePromise(
    (signal, request: (signal: AbortSignal) => MaybePromise<ApiMethodResponse<Type, MethodType>>) => request(signal),
  );

  return {
    request: useImmutableCallback((request) => run((signal) => httpClient.request(method, request, signal))),
    ...asyncValue,
  };
}
