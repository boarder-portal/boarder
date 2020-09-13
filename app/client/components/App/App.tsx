import React from 'react';
import { Switch, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Reset } from 'styled-reset';
import { Normalize } from 'styled-normalize';
import { Container } from '@material-ui/core';
import block from 'bem-cn';
import { useQuery } from '@apollo/react-hooks';

import { GET_USER_QUERY } from 'client/graphql/queries';

import { IUser } from 'common/types';

import Header from 'client/components/Header/Header';

import Home from 'client/pages/Home/Home';
import Registration from 'client/pages/Registration/Registration';
import Login from 'client/pages/Login/Login';
import Lobby from 'client/pages/Lobby/Lobby';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  @font-face {
    font-family: "Round";
    src: url(/font-regular.otf);
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Round";
    src: url(/font-bold.otf);
    font-weight: 900;
    font-style: normal;
  }

  html,
  body {
    height: 100%;
  }

  #root {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  body {
    color: #333;

    * {
      font-family: Round, Helvetica, sans-serif;
    }
  }

  h1 {
    font-size: 100%;
    margin: 0;
  }

  a,
  a:visited {
    color: inherit;
    text-decoration: none;
  }
`;

const Root = styled(Container)`
  &.App {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
`;

const b = block('App');

const App: React.FC = () => {
  const {
    data: userData,
  } = useQuery<{ getUser: IUser | null }>(GET_USER_QUERY);

  const user = userData?.getUser || null;

  return (
    <>
      <Reset />
      <Normalize />
      <GlobalStyle />

      <Header user={user} />

      <Root className={b().toString()}>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>

          <Route exact path="/registration">
            <Registration />
          </Route>

          <Route exact path="/login">
            <Login />
          </Route>

          <Route exact path="/:game/lobby">
            <Lobby />
          </Route>
        </Switch>
      </Root>
    </>
  );
};

export default App;
