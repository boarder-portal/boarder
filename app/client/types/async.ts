export interface InitialAsyncValue {
  value: null;
  isLoading: false;
  isSuccess: false;
  isError: false;
  error: null;
}

export interface LoadingAsyncValue {
  value: null;
  isLoading: true;
  isSuccess: false;
  isError: false;
  error: null;
}

export interface SuccessAsyncValue<T> {
  value: T;
  isLoading: false;
  isSuccess: true;
  isError: false;
  error: null;
}

export interface ErrorAsyncValue {
  value: null;
  isLoading: false;
  isSuccess: false;
  isError: true;
  error: unknown;
}

export type AnyAsyncValue<T> = InitialAsyncValue | LoadingAsyncValue | SuccessAsyncValue<T> | ErrorAsyncValue;
