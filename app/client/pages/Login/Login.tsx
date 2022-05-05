import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import block from 'bem-cn';
import { useSetRecoilState } from 'recoil';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Input from 'client/components/common/Input/Input';
import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

import userAtom from 'client/atoms/userAtom';

const Root = styled(Box)`
  flex-grow: 1;
  justify-content: center;
  align-items: center;

  .Login {
    &__form {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &__password {
      margin-top: 8px;
    }

    &__submit {
      margin-top: 20px;
      width: 100%;
    }
  }
`;

const b = block('Login');

const Login: React.FC = () => {
  const history = useHistory();
  const setUser = useSetRecoilState(userAtom);

  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const user = await httpClient.login({
      user: {
        login: userLogin,
        password,
      },
    });

    setUser(user);
    history.push('/');
  }, [history, password, setUser, userLogin]);

  return (
    <Root className={b()} flex column>
      <Box size="xxl" bold>Вход</Box>

      <form
        className={b('form')}
        onSubmit={handleSubmit}
      >
        <Input
          label="Логин"
          value={userLogin}
          onChange={setUserLogin}
        />

        <Input
          className={b('password').toString()}
          label="Пароль"
          value={password}
          type="password"
          onChange={setPassword}
        />

        <Button
          className={b('submit').toString()}
          isSubmit
        >
          Вход
        </Button>
      </form>
    </Root>
  );
};

export default React.memo(Login);
