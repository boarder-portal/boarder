import classNames from 'classnames';
import times from 'lodash/times';
import { FC, memo } from 'react';

import styles from './Dice.module.scss';

export type DiceType = 1 | 2 | 3 | 4 | 5 | 6;

interface DiceProps {
  number: DiceType;
}

const Dice: FC<DiceProps> = (props) => {
  const { number } = props;

  return (
    <div className={classNames(styles.root, styles[`number_${number}`])}>
      {times(6, (index) => (
        <div key={index} className={styles.circle} />
      ))}
    </div>
  );
};

export default memo(Dice);
