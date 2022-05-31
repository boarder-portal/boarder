import React, { useEffect, useState } from 'react';
import map from 'lodash/map';
import times from 'lodash/times';
import sumBy from 'lodash/sumBy';
import classNames from 'classnames';

import { ECityGoods, EMeepleType, IPlayer } from 'common/types/carcassonne';

import { now } from 'client/utilities/time';

import Meeple from 'client/pages/Game/components/CarcassonneGame/components/Meeple/Meeple';
import Flex from 'client/components/common/Flex/Flex';

import styles from './Player.pcss';

interface IPlayersProps {
  className?: string;
  players: IPlayer[];
  activePlayerIndex: number;
  timeDiff: number;
  turnEndsAt: number | null;
}

const Players: React.FC<IPlayersProps> = (props) => {
  const { className, players, activePlayerIndex, timeDiff, turnEndsAt } = props;

  const [turnSecondsLeft, setTurnSecondsLeft] = useState(0);

  useEffect(() => {
    const setSecondsLeft = () => {
      const secondsLeft = turnEndsAt ? Math.floor((turnEndsAt - timeDiff - now()) / 1000) : 0;

      setTurnSecondsLeft(secondsLeft);
    };

    const interval = setInterval(setSecondsLeft, 1000);

    setSecondsLeft();

    return () => {
      clearInterval(interval);
    };
  }, [timeDiff, turnEndsAt]);

  return (
    <Flex className={classNames(styles.root, className)} direction="column">
      {players.map((player) => {
        const isActive = player.index === activePlayerIndex;

        return (
          <div key={player.login} className={classNames(styles.player, { [styles.active]: isActive })}>
            <div>
              <span>{player.name}</span>
              {isActive && <span> {turnSecondsLeft}</span>}
            </div>

            <div>{sumBy(player.data.score, ({ score }) => score)}</div>

            <div>
              Пшено: {player.data.goods[ECityGoods.WHEAT]}, Ткань: {player.data.goods[ECityGoods.FABRIC]}, Вино:{' '}
              {player.data.goods[ECityGoods.WINE]}
            </div>

            <Flex between={1}>
              {map(player.data.meeples, (count, type) =>
                times(count, (index) => (
                  <Meeple
                    key={`${type}-${index}`}
                    className={styles.meeple}
                    type={type as EMeepleType}
                    color={player.data.color}
                  />
                )),
              )}
            </Flex>
          </div>
        );
      })}
    </Flex>
  );
};

export default React.memo(Players);
