import classNames from 'classnames';
import map from 'lodash/map';
import sumBy from 'lodash/sumBy';
import times from 'lodash/times';
import { FC, memo, useEffect, useState } from 'react';

import { SECOND } from 'common/constants/date';

import { WithClassName } from 'client/types/react';
import { Timestamp } from 'common/types';
import { CityGoodsType, GameOptions, MeepleType, Player } from 'common/types/games/carcassonne';

import Flex from 'client/components/common/Flex/Flex';
import Meeple from 'client/pages/Game/components/CarcassonneGame/components/Meeple/Meeple';

import styles from './Player.module.scss';

interface PlayersProps extends WithClassName {
  players: Player[];
  gameOptions: GameOptions;
  activePlayerIndex: number;
  turnEndsAt: Timestamp | null;
}

const Players: FC<PlayersProps> = (props) => {
  const { className, players, gameOptions, activePlayerIndex, turnEndsAt } = props;

  const [turnSecondsLeft, setTurnSecondsLeft] = useState(0);

  useEffect(() => {
    const setSecondsLeft = () => {
      const secondsLeft = turnEndsAt ? Math.floor(turnEndsAt.timeLeft / SECOND) : 0;

      setTurnSecondsLeft(secondsLeft);
    };

    const interval = setInterval(setSecondsLeft, 100);

    setSecondsLeft();

    return () => {
      clearInterval(interval);
    };
  }, [turnEndsAt]);

  return (
    <Flex className={classNames(styles.root, className)} direction="column">
      {players.map((player) => {
        const isActive = player.index === activePlayerIndex;

        return (
          <div key={player.login} className={classNames(styles.player, { [styles.active]: isActive })}>
            <div>
              <span>{player.name}</span>
              {gameOptions.withTimer && isActive && <span> {turnSecondsLeft}</span>}
            </div>

            <div>{sumBy(player.data.score, ({ score }) => score)}</div>

            <div>
              Пшено: {player.data.goods[CityGoodsType.WHEAT]}, Ткань: {player.data.goods[CityGoodsType.FABRIC]}, Вино:{' '}
              {player.data.goods[CityGoodsType.WINE]}
            </div>

            <Flex between={1}>
              {map(player.data.meeples, (count, type) =>
                times(count, (index) => (
                  <Meeple
                    key={`${type}-${index}`}
                    className={styles.meeple}
                    type={type as MeepleType}
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

export default memo(Players);
