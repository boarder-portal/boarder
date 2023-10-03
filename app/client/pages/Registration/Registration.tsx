import { FC, FormEvent, memo, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import useSharedStoreValue from 'client/hooks/useSharedStoreValue';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Input from 'client/components/common/Input/Input';
import Text from 'client/components/common/Text/Text';

import styles from './Registration.module.scss';

const Registration: FC = () => {
  const history = useHistory();
  const [, setUser] = useSharedStoreValue('user');

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordForCheck, setPasswordForCheck] = useState('');

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
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
    <Flex className={styles.root} direction="column">
      <Text size="xxl" weight="bold">
        Регистрация
      </Text>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input label="Логин" value={login} onChange={setLogin} />

        <Input label="Пароль" value={password} type="password" onChange={setPassword} />

        <Input label="Повторный пароль" value={passwordForCheck} type="password" onChange={setPasswordForCheck} />

        <Button className={styles.submit} type="submit">
          Регистрация
        </Button>
      </form>
    </Flex>
  );
};

export default memo(Registration);
