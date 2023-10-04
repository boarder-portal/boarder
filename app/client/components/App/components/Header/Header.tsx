import { FC, memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import urls from 'client/constants/urls';

import useLoginLink from 'client/hooks/useLoginLink';
import useRequest from 'client/hooks/useRequest';
import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Dropdown from 'client/components/common/Dropdown/Dropdown';
import Flex from 'client/components/common/Flex/Flex';
import Text from 'client/components/common/Text/Text';

import styles from './Header.module.scss';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const [user, setUser] = useSharedStoreValue('user');

  const loginLink = useLoginLink();

  const { request: logout } = useRequest('auth.logout');

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
      <Link to={urls.home}>
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

          <Link to={urls.register} className={styles.registration}>
            Регистрация
          </Link>
        </>
      )}
    </Flex>
  );
};

export default memo(Header);
