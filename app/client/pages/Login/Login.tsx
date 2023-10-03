import { FC, FormEvent, memo, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Input from 'client/components/common/Input/Input';
import Text from 'client/components/common/Text/Text';

import styles from './Login.module.scss';

const Login: FC = () => {
  const history = useHistory();
  const [, setUser] = useSharedStoreValue('user');

  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const user = await httpClient.login({
        user: {
          login: userLogin,
          password,
        },
      });

      setUser(user);
      history.push('/');
    },
    [history, password, setUser, userLogin],
  );

  return (
    <Flex className={styles.root} direction="column">
      <Text size="xxl" weight="bold">
        Вход
      </Text>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input label="Логин" value={userLogin} onChange={setUserLogin} />

        <Input label="Пароль" value={password} type="password" onChange={setPassword} />

        <Button className={styles.submit} type="submit">
          Вход
        </Button>
      </form>
    </Flex>
  );
};

export default memo(Login);
