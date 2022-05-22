import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { IUser } from 'common/types';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import userAtom from 'client/atoms/userAtom';

import styles from './Header.pcss';

interface IHeaderProps {
  user: IUser | null;
}

const Header: React.FC<IHeaderProps> = (props) => {
  const { user } = props;

  const setUser = useSetRecoilState(userAtom);

  const logout = useCallback(async () => {
    await httpClient.logout();

    setUser(null);
  }, [setUser]);

  const userPopup = useMemo(() => {
    return (
      <div className={styles.userPopup} onClick={logout}>
        Выйти
      </div>
    );
  }, [logout]);

  return (
    <Flex className={styles.root} alignItems="center">
      <Link to="/">
        <Text size="l" weight="bold">
          Boarder
        </Text>
      </Link>

      {user ? (
        <Dropdown popup={userPopup} ml="auto">
          {user.login}
        </Dropdown>
      ) : (
        <>
          <Link to="/login" className={styles.login}>
            Вход
          </Link>

          <Link to="/registration" className={styles.registration}>
            Регистрация
          </Link>
        </>
      )}
    </Flex>
  );
};

export default React.memo(Header);
