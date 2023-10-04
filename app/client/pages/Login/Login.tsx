import { FC, FormEvent, memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import urls from 'client/constants/urls';

import useRequest from 'client/hooks/useRequest';
import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Input from 'client/components/common/Input/Input';
import Text from 'client/components/common/Text/Text';

import styles from './Login.module.scss';

const Login: FC = () => {
  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');
  const [, setUser] = useSharedStoreValue('user');

  const loginRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { request: login, isLoading, isError } = useRequest('auth.login');

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const { user } = await login({
        login: userLogin,
        password,
      });

      const searchParams = new URLSearchParams(location.search);

      setUser(user);
      navigate(searchParams.get('from') ?? urls.home);
    },
    [login, userLogin, password, location.search, setUser, navigate],
  );

  useLayoutEffect(() => {
    loginRef.current?.focus();
  }, []);

  return (
    <Flex className={styles.root} direction="column">
      <Text size="xxl" weight="bold">
        Вход
      </Text>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input label="Логин" value={userLogin} inputRef={loginRef} onChange={setUserLogin} />

        <Input label="Пароль" value={password} type="password" onChange={setPassword} />

        <Button className={styles.submit} type="submit" disabled={isLoading}>
          Вход
        </Button>

        <Text className={styles.error}>{isError ? 'Неверный логин или пароль' : '\u00a0'}</Text>
      </form>
    </Flex>
  );
};

export default memo(Login);
