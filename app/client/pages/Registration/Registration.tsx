import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Input from 'client/components/common/Input/Input';
import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';

import styles from './Registration.pcss';

const Registration: React.FC = () => {
  const history = useHistory();
  const setUser = useSetRecoilState(userAtom);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordForCheck, setPasswordForCheck] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const user = await httpClient.register({
        user: {
          login,
          password,
        },
      });

      setUser(user);
      history.push('/');
    },
    [history, login, password, setUser],
  );

  return (
    <Box className={styles.root} flex column>
      <Box size="xxl" bold>
        Регистрация
      </Box>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input label="Логин" value={login} onChange={setLogin} />

        <Input className={styles.password} label="Пароль" value={password} type="password" onChange={setPassword} />

        <Input
          className={styles.password}
          label="Повторный пароль"
          value={passwordForCheck}
          type="password"
          onChange={setPasswordForCheck}
        />

        <Button className={styles.submit} isSubmit>
          Регистрация
        </Button>
      </form>
    </Box>
  );
};

export default React.memo(Registration);
