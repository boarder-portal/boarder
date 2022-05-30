import { memo, FC } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';

import styles from './Dice.pcss';

export type TDice = 1 | 2 | 3 | 4 | 5 | 6;

interface IDiceProps {
  number: TDice;
}

const Dice: FC<IDiceProps> = (props) => {
  const { number } = props;

  return (
    <div className={classNames(styles.root, styles[`number_${number}`])}>
      {times(6, () => (
        <div className={styles.circle} />
      ))}
    </div>
  );
};

export default memo(Dice);
