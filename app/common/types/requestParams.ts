import { DBUser } from 'common/types';

export interface RegisterParams {
  user: DBUser;
}

export interface LoginParams {
  user: DBUser;
}
