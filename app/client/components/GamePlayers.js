import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

import { playersType } from '../constants';

import { colors } from '../../config/constants';

import { Caption } from './Caption';

export class GamePlayers extends Component {
  static propTypes = {
    containerCls: PropTypes.string,
    players: playersType.isRequired
  };

  render() {
    const {
      containerCls,
      players
    } = this.props;

    return (
      <div className={ClassName('players-in-game-list', containerCls)}>
        {players.map(({ id, login, active, color, avatar, score }, ix) => (
          <div
            key={id}
            className={ClassName('player row', {
              active,
              'marg-t-10': ix
            })}
          >

            {color && (
              <div
                className="color-container"
                style={{
                  background: colors[color]
                }}
              />
            )}

            <div className="avatar-container">
              <img className="avatar" src={avatar} />
            </div>

            <div>
              <div>
                <Caption value="games.global.room.player" />: {login}
              </div>
              <div>
                <Caption value="games.global.room.score" />: {score}
              </div>
            </div>

          </div>
        ))}
      </div>
    );
  }
}
