import React, { useCallback, useMemo } from 'react';
import { Container } from '@material-ui/core';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import block from 'bem-cn';
import { useSetRecoilState } from 'recoil';

import { IUser } from 'common/types';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Box from 'client/components/common/Box/Box';
import Dropdown from 'client/components/common/Dropdown/Dropdown';

import userAtom from 'client/atoms/userAtom';

interface IHeaderProps {
  user: IUser | null;
}

const Root = styled(Container)`
  .Header {
    &__login {
      margin-left: auto;
    }

    &__registration {
      margin-left: 8px;
    }
  }
`;

const GlobalStyle = createGlobalStyle`
  .Header__logout {
    cursor: pointer;
  }
`;

const b = block('Header');

const Header: React.FC<IHeaderProps> = (props) => {
  const { user } = props;

  const setUser = useSetRecoilState(userAtom);

  const logout = useCallback(async () => {
    await httpClient.logout();

    setUser(null);
  }, [setUser]);

  const userPopup = useMemo(() => {
    return (
      <Box px={16} py={12}>
        <Box
          className={b('logout').toString()}
          onClick={logout}
        >
          Выйти
        </Box>
      </Box>
    );
  }, [logout]);

  return (
    <Root className={b()}>
      <GlobalStyle />

      <Box py={12} flex alignItems="center">
        <Link to="/">
          <Box size="l" bold>Boarder</Box>
        </Link>

        {user ? (
          <Dropdown
            popup={userPopup}
            ml="auto"
          >
            {user.login}
          </Dropdown>
        ) : (
          <>
            <Link
              to="/login"
              className={b('login').toString()}
            >
              Вход
            </Link>

            <Link
              to="/registration"
              className={b('registration').toString()}
            >
              Регистрация
            </Link>
          </>
        )}
      </Box>
    </Root>
  );
};

export default React.memo(Header);
