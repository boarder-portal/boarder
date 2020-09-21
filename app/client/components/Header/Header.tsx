import React, { useCallback, useMemo } from 'react';
import { Container } from '@material-ui/core';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import block from 'bem-cn';
import { useMutation } from '@apollo/react-hooks';

import { GET_USER_QUERY, LOGOUT_QUERY } from 'client/graphql/queries';

import { IUser } from 'common/types';

import Box from 'client/components/common/Box/Box';
import Dropdown from 'client/components/common/Dropdown/Dropdown';

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

  const [logout] = useMutation(LOGOUT_QUERY);

  const handleLogout = useCallback(async () => {
    await logout({
      refetchQueries: [{ query: GET_USER_QUERY }],
      awaitRefetchQueries: true,
    });
  }, [logout]);

  const userPopup = useMemo(() => {
    return (
      <Box px={16} py={12}>
        <Box
          className={b('logout').toString()}
          onClick={handleLogout}
        >
          Выйти
        </Box>
      </Box>
    );
  }, [handleLogout]);

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
