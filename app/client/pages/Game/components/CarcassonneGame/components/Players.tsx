import React from 'react';
import block from 'bem-cn';
import styled from 'styled-components';
import map from 'lodash/map';
import times from 'lodash/times';
import sumBy from 'lodash/sumBy';

import { ECarcassonneMeepleType, ICarcassonnePlayer } from 'common/types/carcassonne';

import Box from 'client/components/common/Box/Box';
import Meeple from 'client/pages/Game/components/CarcassonneGame/components/Meeple';

interface IPlayersProps {
  className?: string;
  players: ICarcassonnePlayer[];
}

const b = block('Players');

const Root = styled(Box)`
  width: 250px;
  border: 1px solid #000;
  background-color: #fff;

  .Players {
    &__player {
      padding: 4px;

      &_active {
        background-color: yellowgreen;
      }

      &:not(:first-child) {
        border-top: 1px solid #000;
      }
    }

    &__meeple {
      width: 20px;
      height: 20px;
    }
  }
`;

const Players: React.FC<IPlayersProps> = (props) => {
  const { className, players } = props;

  return (
    <Root flex column className={b.mix(className)}>
      {players.map((player) => {
        return (
          <div key={player.login} className={b('player', { active: player.isActive })}>
            <div>{player.login}</div>

            <div>
              {sumBy(player.score, ({ score }) => score)}
            </div>

            <Box flex between={2}>
              {map(player.meeples, (count, type) => (
                times(count, (index) => (
                  <Meeple
                    key={`${type}-${index}`}
                    className={b('meeple')}
                    type={type as ECarcassonneMeepleType}
                    color={player.color}
                  />
                ))
              ))}
            </Box>
          </div>
        );
      })}
    </Root>
  );
};

export default React.memo(Players);
