import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { gamesList } from '../../shared/games';

import { Caption } from '../components';

class GamesList extends Component {
  render() {
    return (
      <div className="route route-games-list">
        <div className="text-center">
          {gamesList.map((game) => (
            <Link
              key={game}
              to={`/games/${game}`}
              className="game-link"
            >
              <Caption value={`games.${game}_caption`} />
            </Link>
          ))}
        </div>
      </div>
    );
  }
}

export default GamesList;
