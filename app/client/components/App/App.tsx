import '../../styles/reset.pcss';
import '../../styles/styles.css';
import { FC, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Container } from 'boarder-components';

import { EGame } from 'common/types/game';

import httpClient from 'client/utilities/HttpClient/HttpClient';

import Header from 'client/components/Header/Header';

import Home from 'client/pages/Home/Home';
import Registration from 'client/pages/Registration/Registration';
import Login from 'client/pages/Login/Login';
import userAtom from 'client/atoms/userAtom';
import Game from 'client/pages/Game/Game';
import PexesoLobby from 'client/pages/games/pexeso/PexesoLobby/PexesoLobby';
import SurvivalOnlineLobby from 'client/pages/games/survivalOnline/SurvivalOnlineLobby/SurvivalOnlineLobby';
import SetLobby from 'client/pages/games/set/SetLobby/SetLobby';
import OnitamaLobby from 'client/pages/games/onitama/OnitamaLobby/OnitamaLobby';
import CarcassonneLobby from 'client/pages/games/carcassonne/CarcassonneLobby/CarcassonneLobby';
import SevenWondersLobby from 'client/pages/games/sevenWonders/SevenWonders/SevenWondersLobby';
import HeartsLobby from 'client/pages/games/hearts/Hearts/HeartsLobby';

import styles from './App.pcss';

const App: FC = () => {
  const [user, setUser] = useRecoilState(userAtom);

  useEffect(() => {
    (async () => {
      const user = await httpClient.getUser();

      setUser(user);
    })();
  }, [setUser]);

  return (
    <>
      <Container className={styles.app}>
        <Header user={user} />

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

          <Route exact path={`/${EGame.HEARTS}/lobby`}>
            <HeartsLobby />
          </Route>

          <Route exact path="/:game/game/:gameId">
            <Game />
          </Route>
        </Switch>
      </Container>
    </>
  );
};

export default App;
