import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { IUser } from 'common/types';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Box from 'client/components/common/Box/Box';
import Dropdown from 'client/components/common/Dropdown/Dropdown';

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
      <Box px={16} py={12}>
        <Box
          className={styles.logout}
          onClick={logout}
        >
          Выйти
        </Box>
      </Box>
    );
  }, [logout]);

  return (
    <Box py={12} flex alignItems="center">
      <Link to="/">
        <Box size="l" bold>Boarder</Box>
      </Link>

      {user ? (
        <Dropdown
          popup={userPopup}
          ml="auto"
        >
          {user.login}
        </Dropdown>
      ) : (
        <>
          <Link
            to="/login"
            className={styles.login}
          >
            Вход
          </Link>

          <Link
            to="/registration"
            className={styles.registration}
          >
            Регистрация
          </Link>
        </>
      )}
    </Box>
  );
};

export default React.memo(Header);
