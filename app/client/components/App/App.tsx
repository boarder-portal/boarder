import '../../styles/reset.scss';

import { FC } from 'react';
import { Switch, Route } from 'react-router-dom';

import Header from 'client/components/Header/Header';

import Home from 'client/pages/Home/Home';
import Registration from 'client/pages/Registration/Registration';
import Login from 'client/pages/Login/Login';
import Game from 'client/pages/Game/Game';
import Lobby from 'client/pages/Lobby/Lobby';

import styles from './App.module.scss';

const App: FC = () => {
  return (
    <>
      <div className={styles.app}>
        <Header />

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

          <Route exact path="/:game/game/:gameId">
            <Game />
          </Route>
        </Switch>
      </div>
    </>
  );
};

export default App;
