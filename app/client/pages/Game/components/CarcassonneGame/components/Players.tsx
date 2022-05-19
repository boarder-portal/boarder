import React, { useEffect, useState } from 'react';
import block from 'bem-cn';
import styled from 'styled-components';
import map from 'lodash/map';
import times from 'lodash/times';
import sumBy from 'lodash/sumBy';

import { ECityGoods, EMeepleType, IPlayer } from 'common/types/carcassonne';

import Box from 'client/components/common/Box/Box';
import Meeple from 'client/pages/Game/components/CarcassonneGame/components/Meeple';

interface IPlayersProps {
  className?: string;
  players: IPlayer[];
  activePlayerIndex: number;
  turnEndsAt: number | null;
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
  const { className, players, activePlayerIndex, turnEndsAt } = props;

  const [turnSecondsLeft, setTurnSecondsLeft] = useState(0);

  useEffect(() => {
    const setSecondsLeft = () => {
      const secondsLeft = turnEndsAt ? Math.floor((turnEndsAt - Date.now()) / 1000) : 0;

      setTurnSecondsLeft(secondsLeft);
    };

    const interval = setInterval(setSecondsLeft, 1000);

    setSecondsLeft();

    return () => {
      clearInterval(interval);
    };
  }, [turnEndsAt]);

  return (
    <Root flex column className={b.mix(className)}>
      {players.map((player) => {
        const isActive = player.index === activePlayerIndex;

        return (
          <div key={player.login} className={b('player', { active: isActive })}>
            <div>
              <span>{player.login}</span>
              {isActive && <span> {turnSecondsLeft}</span>}
            </div>

            <div>{sumBy(player.data.score, ({ score }) => score)}</div>

            <div>
              Пшено: {player.data.goods[ECityGoods.WHEAT]}, Ткань: {player.data.goods[ECityGoods.FABRIC]}, Вино:{' '}
              {player.data.goods[ECityGoods.WINE]}
            </div>

            <Box flex between={2}>
              {map(player.data.meeples, (count, type) =>
                times(count, (index) => (
                  <Meeple
                    key={`${type}-${index}`}
                    className={b('meeple')}
                    type={type as EMeepleType}
                    color={player.data.color}
                  />
                )),
              )}
            </Box>
          </div>
        );
      })}
    </Root>
  );
};

export default React.memo(Players);
