import '../../styles/reset.scss';
import '../../styles/globals.scss';

import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';

import urls from 'client/constants/urls';

import Header from 'client/components/App/components/Header/Header';

import Game from 'client/pages/Game/Game';
import Home from 'client/pages/Home/Home';
import Lobby from 'client/pages/Lobby/Lobby';
import Login from 'client/pages/Login/Login';
import Registration from 'client/pages/Registration/Registration';

import styles from './App.module.scss';

const App: FC = () => {
  return (
    <div className={styles.app}>
      <Header />

      <Routes>
        <Route path={urls.home} element={<Home />} />

        <Route path={urls.register} element={<Registration />} />
        <Route path={urls.login} element={<Login />} />

        <Route path={urls.lobby} element={<Lobby />} />
        <Route path={urls.game} element={<Game />} />
      </Routes>
    </div>
  );
};

export default App;
