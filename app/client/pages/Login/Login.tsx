import { FC, FormEvent, memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import authHttpClient from 'client/utilities/HttpClient/AuthHttpClient';

import usePromise from 'client/hooks/usePromise';
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

  const history = useHistory();
  const location = useLocation();

  const {
    run: login,
    isLoading,
    isError,
  } = usePromise((signal) =>
    authHttpClient.login(
      {
        login: userLogin,
        password,
      },
      signal,
    ),
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const { user } = await login();

      const searchParams = new URLSearchParams(location.search);

      setUser(user);
      history.push(searchParams.get('from') ?? '/');
    },
    [login, location.search, setUser, history],
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
