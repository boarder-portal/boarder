import { FC, FormEvent, memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import urls from 'client/constants/urls';

import useRequest from 'client/hooks/useRequest';
import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Input from 'client/components/common/Input/Input';
import Text from 'client/components/common/Text/Text';

import styles from './Registration.module.scss';

const Registration: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordForCheck, setPasswordForCheck] = useState('');
  const [, setUser] = useSharedStoreValue('user');

  const loginRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const { request: register, isLoading, isError } = useRequest('auth.register');

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const { user } = await register({
        login,
        password,
      });

      setUser(user);
      navigate(urls.home);
    },
    [login, navigate, password, register, setUser],
  );

  useLayoutEffect(() => {
    loginRef.current?.focus();
  }, []);

  return (
    <Flex className={styles.root} direction="column">
      <Text size="xxl" weight="bold">
        Регистрация
      </Text>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input label="Логин" value={login} inputRef={loginRef} onChange={setLogin} />

        <Input label="Пароль" value={password} type="password" onChange={setPassword} />

        <Input label="Повторный пароль" value={passwordForCheck} type="password" onChange={setPasswordForCheck} />

        <Button className={styles.submit} type="submit" disabled={isLoading}>
          Регистрация
        </Button>

        <Text className={styles.error}>{isError ? 'Ошибка регистрации' : '\u00a0'}</Text>
      </form>
    </Flex>
  );
};

export default memo(Registration);
