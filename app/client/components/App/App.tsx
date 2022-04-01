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
import { EGame } from 'common/types/game';

import Header from 'client/components/Header/Header';

import Home from 'client/pages/Home/Home';
import Registration from 'client/pages/Registration/Registration';
import Login from 'client/pages/Login/Login';
import Room from 'client/pages/Room/Room';
import userAtom from 'client/atoms/userAtom';
import Game from 'client/pages/Game/Game';
import PexesoLobby from 'client/pages/games/pexeso/PexesoLobby/PexesoLobby';
import SurvivalOnlineLobby from 'client/pages/games/survivalOnline/SurvivalOnlineLobby/SurvivalOnlineLobby';
import MazeLobby from 'client/pages/games/maze/MazeLobby/MazeLobby';
import SetLobby from 'client/pages/games/set/SetLobby/SetLobby';
import OnitamaLobby from 'client/pages/games/onitama/OnitamaLobby/OnitamaLobby';
import CarcassonneLobby from 'client/pages/games/carcassonne/CarcassonneLobby/CarcassonneLobby';
import SevenWondersLobby from 'client/pages/games/sevenWonders/SevenWonders/SevenWondersLobby';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
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

  img {
    display: block;
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

          <Route exact path={`/${EGame.PEXESO}/lobby`}>
            <PexesoLobby />
          </Route>

          <Route exact path={`/${EGame.SURVIVAL_ONLINE}/lobby`}>
            <SurvivalOnlineLobby />
          </Route>

          <Route exact path={`/${EGame.MAZE}/lobby`}>
            <MazeLobby />
          </Route>

          <Route exact path={`/${EGame.SET}/lobby`}>
            <SetLobby />
          </Route>

          <Route exact path={`/${EGame.ONITAMA}/lobby`}>
            <OnitamaLobby />
          </Route>

          <Route exact path={`/${EGame.CARCASSONNE}/lobby`}>
            <CarcassonneLobby />
          </Route>

          <Route exact path={`/${EGame.SEVEN_WONDERS}/lobby`}>
            <SevenWondersLobby />
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
