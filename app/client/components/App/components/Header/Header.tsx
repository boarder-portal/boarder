import { FC, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import authHttpClient from 'client/utilities/HttpClient/AuthHttpClient';

import useLoginLink from 'client/hooks/useLoginLink';
import usePromise from 'client/hooks/usePromise';
import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Header.module.scss';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const [user, setUser] = useSharedStoreValue('user');

  const loginLink = useLoginLink();

  const { run: logout } = usePromise((signal) => authHttpClient.logout(signal));

  const handleLogoutClick = useCallback(async () => {
    await logout();

    setUser(null);
  }, [logout, setUser]);

  const userPopup = useMemo(() => {
    return (
      <div className={styles.userPopup} onClick={handleLogoutClick}>
        Выйти
      </div>
    );
  }, [handleLogoutClick]);

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
          <Link to={loginLink} className={styles.login}>
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
