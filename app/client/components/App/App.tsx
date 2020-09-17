import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Reset } from 'styled-reset';
import { Normalize } from 'styled-normalize';
import { Container } from '@material-ui/core';
import block from 'bem-cn';
import { useQuery } from '@apollo/react-hooks';
import { useSetRecoilState } from 'recoil';

import { GET_USER_QUERY } from 'client/graphql/queries';

import { IUser } from 'common/types';

import Header from 'client/components/Header/Header';

import Home from 'client/pages/Home/Home';
import Registration from 'client/pages/Registration/Registration';
import Login from 'client/pages/Login/Login';
import Lobby from 'client/pages/Lobby/Lobby';
import Room from 'client/pages/Room/Room';
import userAtom from 'client/atoms/userAtom';
import Game from 'client/pages/Game/Game';

const Root = styled(Container)`
  &.App {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
`;

const b = block('App');

const App: React.FC = () => {
  const setUser = useSetRecoilState(userAtom);

  const {
    data: userData,
  } = useQuery<{ getUser: IUser | null }>(GET_USER_QUERY);

  const user = userData?.getUser || null;

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [setUser, user]);

  return (
    <>
      <Reset />
      <Normalize />

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

          <Route exact path="/:game/room/:roomId">
            <Room />
          </Route>

          <Route exact path="/:game/game/:gameId">
            <Game />
          </Route>
        </Switch>
      </Root>
    </>
  );
};

export default App;
