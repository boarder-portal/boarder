import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Input from 'client/components/common/Input/Input';
import Text from 'client/components/common/Text/Text';
import Flex from 'client/components/common/Flex/Flex';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';

import styles from './Login.pcss';

const Login: React.FC = () => {
  const history = useHistory();
  const setUser = useSetRecoilState(userAtom);

  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        <Input className={styles.password} label="Пароль" value={password} type="password" onChange={setPassword} />

        <Button className={styles.submit} type="submit">
          Вход
        </Button>
      </form>
    </Flex>
  );
};

export default React.memo(Login);
