import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import block from 'bem-cn';
import { useMutation } from '@apollo/react-hooks';

import { LOGIN_QUERY, GET_USER_QUERY } from 'client/graphql/queries';

import { ILoginParams } from 'common/types/requestParams';
import { IUser } from 'common/types';

import Input from 'client/components/common/Input/Input';
import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

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

  const [userLogin, setUserLogin] = useState('');
  const [password, setPassword] = useState('');

  const [
    login,
    {
      data: newUserData,
    },
  ] = useMutation<IUser, ILoginParams>(LOGIN_QUERY);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    await login({
      variables: {
        user: {
          login: userLogin,
          password,
        },
      },
      refetchQueries: [{ query: GET_USER_QUERY }],
      awaitRefetchQueries: true,
    });
  }, [login, password, userLogin]);

  useEffect(() => {
    if (newUserData) {
      history.push('/');
    }
  }, [history, newUserData]);

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
