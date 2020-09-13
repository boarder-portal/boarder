import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import Input from 'client/components/common/Input/Input';
import Box from 'client/components/common/Box/Box';
import Button from 'client/components/common/Button/Button';

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
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    console.log('submit');
  }, []);

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
