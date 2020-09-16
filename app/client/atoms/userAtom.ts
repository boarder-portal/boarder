import { atom } from 'recoil';

import { IUser } from 'common/types';

const userAtom = atom<IUser | null>({
  key: 'cartState',
  default: null,
});

export default userAtom;
