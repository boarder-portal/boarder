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

  .Registration {
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

const b = block('Registration');

const Registration: React.FC = () => {
  const history = useHistory();
  const setUser = useSetRecoilState(userAtom);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordForCheck, setPasswordForCheck] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const user = await httpClient.register({
      user: {
        login,
        password,
      },
    });

    setUser(user);
    history.push('/');
  }, [history, login, password, setUser]);

  return (
    <Root className={b()} flex column>
      <Box size="xxl" bold>Регистрация</Box>

      <form
        className={b('form')}
        onSubmit={handleSubmit}
      >
        <Input
          label="Логин"
          value={login}
          onChange={setLogin}
        />

        <Input
          className={b('password').toString()}
          label="Пароль"
          value={password}
          type="password"
          onChange={setPassword}
        />

        <Input
          className={b('password').toString()}
          label="Повторный пароль"
          value={passwordForCheck}
          type="password"
          onChange={setPasswordForCheck}
        />

        <Button
          className={b('submit').toString()}
          isSubmit
        >
          Регистрация
        </Button>
      </form>
    </Root>
  );
};

export default React.memo(Registration);
