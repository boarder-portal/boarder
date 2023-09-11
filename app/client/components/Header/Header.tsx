import { FC, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import useAtom from 'client/hooks/useAtom';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Header.module.scss';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const [user, setUser] = useAtom('user');

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
        <Dropdown className={styles.login} popup={userPopup} popupPosition="bottomRight">
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

export default memo(Header);
